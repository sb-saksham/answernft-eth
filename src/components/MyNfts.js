import { React, useEffect, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import FloatingLabel from "react-bootstrap/esm/FloatingLabel";
import axios from "axios";

import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from "wagmi";
import { readContract } from "wagmi/actions";

import AnswerNFTArtifacts from "../artifacts/contracts/answerNFT.sol/AnswerNFT.json";
import useDebounce from "../hooks/useDebounce";
import Button from "react-bootstrap/esm/Button";

const ContractDetails = {
    address: "0x28892DD79c562A9e9A5242B9f9b478C1CF8d8d23",
    abi: AnswerNFTArtifacts.abi
}
const IndNftCard = ({ ipfsHash, tokenId }) => {
    const [priceRef, setPriceRef] = useState();
    const [alreadyListed, setAlreadyListed] = useState();
    const debouncedPriceRef = useDebounce(priceRef, 500);
    useEffect(() => {
        async function getStatus() {
            const st = await readContract({
                ...ContractDetails,
                functionName: "listingExists",
                args:[tokenId]
            })
            setAlreadyListed(st);
        }
        getStatus();
    }, [alreadyListed]);
    const { config: listNftConfig, error: listNftPrepError } = usePrepareContractWrite({
        ...ContractDetails,
        functionName: "listNFT",
        args:[tokenId, debouncedPriceRef]
    });

    const {
        data: listNftData,
        isLoading: listNftIsLoading,
        error: listNftError,
        writeAsync: listNftWrite,
        isSuccess: listNftIsSuccess,
    } = useContractWrite(listNftConfig);
    const {
        data: withdrawNftData,
        isLoading: withdrawNftIsLoading,
        error: withdrawNftError,
        writeAsync: withdrawNftWrite,
        isSuccess: withdrawNftIsSuccess,
    } = useContractWrite(withdrawNftConfig);
    const { config: withdrawNftConfig, error: withdrawNftPrepError } = usePrepareContractWrite({
        ...ContractDetails,
        functionName: "withdrawNFT",
        args:[tokenId]
    });
    let metadt;
    metadt = axios.get(ipfsHash?.replace(
        "ipfs://",
        "https://ipfs.io/ipfs/"
    )).then((res) => { metadt = res.data });
    return (
    <Col md="4" sm="12">
        <Card style={{ width: '18rem' }}>
            <Card.Img variant="top" src={metadt.image.replace("ipfs://", "https://ipfs/io/")} />
            <Card.Body>
                <Card.Title>{ tokenId }: {metadt.question}</Card.Title>
                <Card.Text>Description: {metadt.description}</Card.Text>
            </Card.Body>
            <Card.Body>
                <ListGroup className="list-group-flush">
                    <ListGroup.Item></ListGroup.Item>
                    <ListGroup.Item>Answer Type: {metadt.answerType}</ListGroup.Item>
                    <ListGroup.Item>Answer Length: {metadt.answerLength}</ListGroup.Item>
                </ListGroup>
            </Card.Body>
            <Card.Body>
                <Card.Text>
                    <Form>
                        {alreadyListed ? <Button variant="info" onClick={async () => {
                            await withdrawNftWrite?.();
                        }}>Withdraw NFT</Button> : 
                            <><FloatingLabel controlId="floatingprice" label="Price" className='mb-3'>
                                <Form.Control
                                    type="number"
                                    placeholder="0.1 ETH"
                                    onChange={(e) => { setPriceRef(e.target.value) }}
                                    name="price"
                                    required
                                    isValid={!listNftPrepError}
                                    isInvalid={listNftPrepError}
                                />
                                <Form.Text id="priceHelpBlock" muted>
                                    Set the Price for NFT
                                </Form.Text>
                                <Form.Control.Feedback type='invalid'>{listNftPrepError?.message}</Form.Control.Feedback>
                            </FloatingLabel>
                            <Button onClick={async () => {
                                await listNftWrite?.();
                            }} variant="info">List NFT</Button>
                            </>}
                    </Form>
                </Card.Text>
            </Card.Body>
        </Card>
    </Col>);
}
const MyNfts = () => {
    const { address: userAddress } = useAccount();
    const [tokenIds, setTokenIds] = useState([]);
    const [tokensMetadata, setTokensMetadata] = useState([]);
    const { data: allTokensCount, isError: allTokensError, isLoading: allTokensIsLoading } = useContractRead({
        ...ContractDetails,
        functionName: "balanceOf",
        args: [userAddress]
    });
    // const {data: }
    useEffect(() => {
        async function fetchDt() {
            const tkIds = [];
            if (allTokensCount !== 0n) {
                console.log("counting?", allTokensCount);
                // allTokensCount = BigInt(allTokensCount);
                for (let i = 0n; i < allTokensCount; i++) {
                    const tokenId = await readContract({
                        ...ContractDetails,
                        functionName: "tokenOfOwnerByIndex",
                        args: [userAddress, i]
                    });
                    tokenIds.push(tokenId);
                }
                setTokenIds(tkIds);
                console.log(tokenIds);
            }
            const tokensMetData = [];
            if (tokenIds.length !== 0) {
                console.log(tokenIds);
                const tokensData = await Promise.all(
                    tokenIds.map(async (tokenId) => {
                        // Retrieve metadata or other relevant information for each token
                        const tokenMetadata = await readContract({
                            ...ContractDetails,
                            functionName: "getTokenMetadata",
                            args: [tokenId]
                        });
                        console.log("tokenMetadata", tokenMetadata)
                        tokensMetData.push({ tokenId: tokenId, ipfsHash: tokenMetadata.ipfsHash });
                        return { tokenId, ipfsHash: tokenMetadata.ipfsHash }
                    })
                );
                setTokensMetadata(tokensMetData);
            }
        } fetchDt();
    }, [allTokensCount, userAddress]);
    return (
            
    <Row className="px-5 align-items-center">
        <h2>NFTs owned by {userAddress}</h2>
          {tokensMetadata ? tokensMetadata?.map(async (nft) => {
              return <IndNftCard tokenId={nft.tokenId} ipfsHash={nft.ipfsHash}/>
          }): <h3>No NFTs Found!</h3>}
    </Row>
  );
};

export default MyNfts;