import { React, useEffect, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import axios from "axios";

import { useAccount, useContractRead } from "wagmi";
import { readContract } from "wagmi/actions";

import AnswerNFTArtifacts from "../artifacts/contracts/answerNFT.sol/AnswerNFT.json";

const ContractDetails = {
    address: "0x28892DD79c562A9e9A5242B9f9b478C1CF8d8d23",
    abi: AnswerNFTArtifacts.abi
}

const MyNfts = () => {
    const { address: userAddress } = useAccount();
    const [tokenIds, setTokenIds] = useState([]);
    const [tokensMetadata, setTokensMetadata] = useState();
    const { data: allTokensCount, isError: allTokensError, isLoading: allTokensIsLoading } = useContractRead({
        ...ContractDetails,
        functionName: "balanceOf",
        args: [userAddress]
    })
    useEffect(() => {
        async function fetchDt() {
            const tkIds = [];
            if (allTokensCount) {
                for (let i = 0; i < allTokensCount; i++) {
                    const tokenId = await readContract({
                        ...ContractDetails,
                        functionName: "tokenOfOwnerByIndex",
                        args: [userAddress, i]
                    });
                    tokenIds.push(tokenId);
                }
                setTokenIds(tkIds);
                const tokensData = await Promise.all(
                    tokenIds.map(async (tokenId) => {
                        // Retrieve metadata or other relevant information for each token
                        const tokenMetadata = await readContract({
                            ...ContractDetails,
                            functionName: "getTokenMetadata",
                            args: [tokenId]
                        });
                        return { tokenId, ipfsHash: tokenMetadata.ipfsHash }
                    })
                );
                setTokensMetadata(tokensData);
            }
        }
        fetchDt();
     }, [allTokensCount, tokenIds, userAddress]);


    // Fetch and store additional data for each token, e.g., metadata or URI
   
  return (
    <Row className="px-5 align-items-center">
        <h2>NFTs owned by {userAddress}</h2>
          {tokensMetadata ? tokensMetadata?.map(async (nft) => {
              const metadt = await axios.get(nft.ipfsHash?.replace(
                  "ipfs://",
                  "https://ipfs.io/ipfs/"
              ));
              const dt = metadt.data;
              return (
                  <Col md="4" sm="12">
                      <Card style={{ width: '18rem' }}>
                          <Card.Img variant="top" src="https://ipfs/io" />
                          <Card.Body>
                              <Card.Title>{ nft.tokenId }: {dt.question}</Card.Title>
                              <Card.Text>Description: {dt.description}</Card.Text>
                          </Card.Body>
                          <Card.Body>
                              <ListGroup className="list-group-flush">
                                  <ListGroup.Item></ListGroup.Item>
                                  <ListGroup.Item>Answer Type: {dt.answerType}</ListGroup.Item>
                                  <ListGroup.Item>Answer Length: {dt.answerLength}</ListGroup.Item>
                              </ListGroup>
                          </Card.Body>
                          <Card.Body>
                              <Card.Text>
                                  <Form>
                                      <FloatingLabel controlId="floatingprice" label="Price" className='mb-3'>
                                          <Form.Control
                                              type="number"
                                              placeholder="0.1 ETH"
                                              onChange={(e) => { setPriceRef(e.target.value) }}
                                              name="price"
                                              required
                                              isValid={!buyNftPrepError}
                                              isInvalid={buyNftPrepError}
                                          />
                                          <Form.Text id="priceHelpBlock" muted>
                                              Set the Price for NFT
                                          </Form.Text>
                                          <Form.Control.Feedback type='invalid'>{buyNftPrepError?.message}</Form.Control.Feedback>
                                      </FloatingLabel>
                                  </Form>
                              </Card.Text>
                          </Card.Body>
                      </Card>
                  </Col>);
          }):null}
    </Row>
  );
};

export default MyNfts;