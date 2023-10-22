import { React, useState } from 'react';
import Row from "react-bootstrap/row";
import Col from "react-bootstrap/col";
import Container from 'react-bootstrap/esm/Container';
import Button from 'react-bootstrap/esm/Button';
import Figure from 'react-bootstrap/Figure';

import MintNFTModal from './MintNFT';

const Hero = () => {
  return (<Row>
    <Col sm="12" md="6" className='align-self-center'>
      <Row><Col sm="12">
        <Figure>
          <Figure.Image src='logo.jpeg'>
          </Figure.Image>
        </Figure>  
      </Col></Row>
      <h3>
        AnswerNFTs Bridging the Puzzling and Riddling community to Web3</h3>
      <h4>Mint your unique puzzle, question or riddle into NFT. The catch is only the person who knows the answer can buy it!</h4>
    </Col>
    <Col sm="12" md="6">
      <Figure>
        <Figure.Image src='hero.jpg'>
        </Figure.Image>
      </Figure>
    </Col>
  </Row>);
}
function Homepage() {
  const [showMint, setShowMint] = useState(false);
  return (
    <>
        <MintNFTModal show={showMint} onHide={()=>setShowMint(false)} />
        <Row className='mt-0'>
          <Hero/>
          <Col sm="12">
              <Button onClick={()=>setShowMint(true)}>Mint AnswerNFTs</Button>
          </Col>
        </Row>
      </>
  );
}

export default Homepage;
