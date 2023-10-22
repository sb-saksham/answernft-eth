import { React, useState } from 'react';
import Row from "react-bootstrap/row";
import Col from "react-bootstrap/col";
import Container from 'react-bootstrap/esm/Container';
import Button from 'react-bootstrap/esm/Button';

import MintNFTModal from './MintNFT';

const Hero = () => {
  return (<Container>

  </Container>);
}
function Homepage() {
  const [showMint, setShowMint] = useState(false);
  return (
      <>
        <MintNFTModal show={showMint} onHide={()=>setShowMint(false)} />
        <Row>
          <Col sm="12">
              <Button onClick={()=>setShowMint(true)}>Mint AnswerNFTs</Button>
          </Col>
        </Row>
      </>
  );
}

export default Homepage;
