import Card from "react-bootstrap/esm/Card";
import Button from "react-bootstrap/esm/Button";
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Form from "react-bootstrap/Form";

import { readContracts, useContractRead } from "wagmi";
import { parseEther } from "ethers";

import useDebounce from "../hooks/useDebounce";
import AnswerNFTArtifacts from "../artifacts/contracts/answerNFT.sol/AnswerNFT.json";
import AnswerNFTMarketplaceArtifacts from "../artifacts/contracts/answerNFTMarketplace.sol/AnswerNFTMarketplace.json";

const MarketContractDetails = {
    address: "0xb877474EA521D4eF83E7e42A788Da769000a7EDc",
    abi: AnswerNFTMarketplaceArtifacts.abi
}
const ContractDetails = {
    address: "0x28892DD79c562A9e9A5242B9f9b478C1CF8d8d23",
    abi: AnswerNFTArtifacts.abi
}
function ListNFT() {
    const [answerRef, setAnswerRef] = useState();
    const debouncedAnswerRef = useDebounce(answerRef, 500);
    const [showAnswer, setShowAnswer] = useState(false);
    const {
        data: totalSupply,
        error: totalSupplyReadError,
        isLoading: totalSupplyIsLoading } = useContractRead({
            ...ContractDetails,
            functionName: "totalSupply"
        });
    const tokenIds = [...Array(Number(totalSupply)).keys()];
    const allNFTsForSale = async (tokenId) => {
        const owner = await readContracts({
            ...ContractDetails,
            functionName: "ownerOf",
            args: [tokenId]
        });
        const tokenURI = await readContracts({
            ...ContractDetails,
            functionName: "tokenURI",
            args: [tokenId]
        });
        return { tokenId, owner, tokenURI };
    }
    return (
    <>
    <Row>
        <Col sm="12">
            <h1>AnswerNFTs for Sale</h1>  
            <br />
            <h4>Solve the Question/Puzzle/Riddle and own the NFT</h4>
            <br/>
        </Col>  
    </Row>
    <Row className="px-5 align-items-center">
        <Col md="4" sm="12">
        <Card style={{ width: '18rem' }}>
            <Card.Img variant="top" src="student.jpg" />
            <Card.Body>
                <Card.Title>{question}</Card.Title>
                <Card.Text>Description: {description}</Card.Text>
            </Card.Body>
            <Card.Body>
                <ListGroup className="list-group-flush">
                    <ListGroup.Item></ListGroup.Item>
                    <ListGroup.Item>Answer Type: {answerType}</ListGroup.Item>
                    <ListGroup.Item>Answer Length: {answerLength}</ListGroup.Item>
                </ListGroup>
            </Card.Body>
            <Card.Body>
                <Card.Text>
                    <Form>
                    <FloatingLabel controlId="floatinganswerhash" label="Answer To Question" className='mb-3'>
                        <InputGroup>
                            <Form.Control
                                type={showAnswer ? "text" : "password"}
                                placeholder="***********"
                                onChange={(e) => { setAnswerRef(stringToBytes(e.target.value))}}
                                name="answer"
                                required
                                isValid={!buyNftPrepError}
                                isInvalid={buyNftPrepError}
                            />
                            <Button variant='outline' onClick={() => setShowAnswer(!showAnswer)}>{showAnswer ? <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg> : <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15.0007 12C15.0007 13.6569 13.6576 15 12.0007 15C10.3439 15 9.00073 13.6569 9.00073 12C9.00073 10.3431 10.3439 9 12.0007 9C13.6576 9 15.0007 10.3431 15.0007 12Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12.0012 5C7.52354 5 3.73326 7.94288 2.45898 12C3.73324 16.0571 7.52354 19 12.0012 19C16.4788 19 20.2691 16.0571 21.5434 12C20.2691 7.94291 16.4788 5 12.0012 5Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>}</Button>
                        </InputGroup>
                        <Form.Text id="descriptionHelpBlock" muted>
                            Answer to the question.
                        </Form.Text>
                        <Form.Control.Feedback type='invalid'>{buyNftPrepError?.message}</Form.Control.Feedback>
                    </FloatingLabel>
                    </Form>
                </Card.Text>
            </Card.Body>
        </Card>
        </Col>
    </Row></>
  );
}

export default BuyNFT;