import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from "react-bootstrap/Modal";
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FloatingLabel from 'react-bootstrap/esm/FloatingLabel';
import { toast } from 'react-toastify';

import {parseEther, keccak256} from "ethers";
import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import { waitForTransaction } from "wagmi/actions";

import AnswerNFTArtifacts from "../artifacts/contracts/answerNFT.sol/AnswerNFT.json"
import useDebounce from "../hooks/useDebounce";

const ContractDetails = {
    address: "0x87A555014b415118f690394c2DD2bC7E50082f97",
    abi: AnswerNFTArtifacts.abi
}
function stringToBytes(str) {
    let bytes = [];
    for (let i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i).toString(16));
    }
    return '0x' + bytes.join('');
}
const MintNFTModal = (props) => {    
    const [answerHashRef, setAnswerHashRef] = useState();
    const [statusOf, setStatusOf] = useState(null);
    const debouncedAnswerHashRef = useDebounce(answerHashRef, 500);
    const [ipfsHash, setIpfsHash] = useState("");
    const [showAnswer, setShowAnswer] = useState(false);
    const [disableButton, setDisableButton] = useState(false);
    const { config: mintNftConfig, error: mintNftPrepError } = usePrepareContractWrite({
        ...ContractDetails,
        functionName: "safeMint",
        args: [debouncedAnswerHashRef || "0x0", ipfsHash.toString() || ""],
        value: parseEther("0.01")
    })
    const {
        data: mintNftData,
        isLoading: mintNftIsLoading,
        error: mintNftError,
        writeAsync: mintNftWrite,
        isSuccess: mintNftIsSuccess,
    } = useContractWrite(mintNftConfig);
    const mint = async (file, metadata) => {
        console.log(process.env.REACT_APP_API_KEY)
        setStatusOf("Starting Uploding of image to IPFS...");
        let imageIpfsHash = null;
        let metadataIpfsHash = null;
        const requestHeaders = new Headers();
        requestHeaders.set(
          "pinata_api_key",
          `${process.env.REACT_APP_API_KEY}`
        );
        requestHeaders.set(
          "pinata_secret_api_key",
          `${process.env.REACT_APP_API_SECRET}`
        );
        try {
            const data = new FormData()
            data.append("file",file)
            data.append("pinataMetadata", '{"name": "AnswerNFTs"}')
        
            const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
            method: 'POST',
            headers: requestHeaders,
            body: data
            })
            let resData = await res.json()
            console.log("File uploaded, CID:", resData.IpfsHash)
            imageIpfsHash = resData.IpfsHash;
        } catch (error) {
            toast.error(error);
        }
        
        if (imageIpfsHash) {
            setStatusOf("Image uploaded to IPFS. Now Uploading metadata...");
            requestHeaders.set("Content-Type", "application/json");
            try {
                const data = JSON.stringify({
                    pinataContent: {
                        question: `${metadata.question}`,
                        description: `${metadata.description}`,
                        answerType: `${metadata.answerType}`,
                        answerLength: `${metadata.answerLength}`,
                        image: `ipfs://${imageIpfsHash}`,
                    },
                    pinataMetadata: {
                        name: "Answer NFT Metadata",
                    },
                });
        
                const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
                    method: 'POST',
                    headers: requestHeaders,
                    body: data
                })
                const resData = await res.json()
                console.log("Metadata uploaded, CID:", resData.IpfsHash)
                metadataIpfsHash = resData.IpfsHash;
            } catch (error) {
                toast.error(error);
            }
        } else {
            toast.error("Image cannot be uploaded! Please try again!");
        }
        if (imageIpfsHash && metadataIpfsHash) {
            setStatusOf("Metadata Uploaded to IPFS. Minting NFT on Contract...");
            setIpfsHash(metadataIpfsHash);
            try {
                const tx = await mintNftWrite?.();
                const res = await waitForTransaction({ hash: tx.hash });
                if (res.status === "success") {
                    toast.success("Successfully Minted NFT!");
                    window.location = "/";
                }
            } catch (error) {
                toast.error(error);
            }
        }
    }
    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="mint-answer-nft"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Mint New Answer NFT
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {statusOf ? <h5>{statusOf}</h5>:null}
                <Form onSubmit={async (event) => {
                    event.preventDefault();
                    setDisableButton(true);
                    let metadata = {}
                    for (let input in event.target) {
                        try {
                            const inp = event.target[input];
                            if (inp.name === "image") {
                                metadata[inp.name] = inp.files[0];
                            } else {
                                metadata[inp.name] = inp.value;
                            }
                        }
                        catch(e){}
                    }
                    console.log(metadata);
                    await mint(metadata.image, metadata);
                    setDisableButton(false);
                }}>
                    <FloatingLabel controlId="floatingquestion" label="Question" className='mb-3'>
                        <Form.Control
                            type="text"
                            placeholder="What will be the... If this is..."
                            name="question"
                            required
                        />
                        <Form.Control.Feedback type='invalid'>Question is Required!</Form.Control.Feedback>
                    </FloatingLabel>
                    <FloatingLabel controlId="floatingDescription" label="Description(Elaboration/Hint/Instructions)" className='mb-3'>
                        <Form.Control
                            type="text"
                            placeholder="It's a Even Number"
                            name="description"
                            required
                        />
                        <Form.Text id="descriptionHelpBlock" muted>
                            Describe the question. You can provide hints, instructions, constraints or context for question. Anything that is required for the question to be solved.
                        </Form.Text>
                        <Form.Control.Feedback type='invalid'>Description is Required!</Form.Control.Feedback>
                    </FloatingLabel>
                    <FloatingLabel controlId="floatingtype" label="Answer Type" className='mb-3'>
                        <Form.Control
                            type="text"
                            placeholder="Text"
                            name="answerType"
                            required
                        />
                        <Form.Text id="ansTypeHelpBlock" muted>
                            This could be Text/Number/Digit/Bytes/Character 
                        </Form.Text>
                        <Form.Control.Feedback type='invalid'>Answer Type is Required!</Form.Control.Feedback>
                    </FloatingLabel>
                    <FloatingLabel controlId="floatingAnswerLength" label="Answer Length" className='mb-3'>
                        <Form.Control
                            type="text"
                            placeholder="152 Chars and 20 words(including space)"
                            name="answerLength"
                            required
                        />
                        <Form.Text id="descriptionHelpBlock" muted>
                            Please be specific and provide number of characters (including spaces if any) and number of words.
                        </Form.Text>
                        <Form.Control.Feedback type='invalid'>Answer Length is Required!</Form.Control.Feedback>
                    </FloatingLabel>
                    <Form.Group controlId="formImage" className="mb-3">
                        <Form.Label>Image</Form.Label>
                        <Form.Control type="file" name="image" />
                        <Form.Text id="imageBlock" muted>
                            Provide any relevant image to question(If there isn't any just provide a cool placeholder for your NFT!)
                        </Form.Text>
                    </Form.Group>
                    <FloatingLabel controlId="floatinganswerhash" label="Answer To Question" className='mb-3'>
                        <InputGroup>
                            <Form.Control
                                type={showAnswer ? "text" : "password"}
                                placeholder="***********"
                                onChange={(e) => { setAnswerHashRef(keccak256(stringToBytes(e.target.value)))}}
                                name="answer"
                                required
                                isValid={!mintNftPrepError}
                                isInvalid={mintNftPrepError}
                            />
                            <Button variant='outline' onClick={() => setShowAnswer(!showAnswer)}>{showAnswer ? <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg> : <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M15.0007 12C15.0007 13.6569 13.6576 15 12.0007 15C10.3439 15 9.00073 13.6569 9.00073 12C9.00073 10.3431 10.3439 9 12.0007 9C13.6576 9 15.0007 10.3431 15.0007 12Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M12.0012 5C7.52354 5 3.73326 7.94288 2.45898 12C3.73324 16.0571 7.52354 19 12.0012 19C16.4788 19 20.2691 16.0571 21.5434 12C20.2691 7.94291 16.4788 5 12.0012 5Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>}</Button>
                        </InputGroup>
                        <Form.Text id="descriptionHelpBlock" muted>
                            Answer to the question.
                        </Form.Text>
                        <Form.Control.Feedback type='invalid'>{mintNftPrepError?.message}</Form.Control.Feedback>
                    </FloatingLabel>
                    <Button type="submit" variant="info" disabled={disableButton || mintNftIsLoading || mintNftPrepError}>Mint AnswerNFT</Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}
export default MintNFTModal;