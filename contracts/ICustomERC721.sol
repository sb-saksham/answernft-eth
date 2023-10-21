// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface ICustomERC721 is IERC721 {
    struct Metadata {
        string ipfsHash;
        bytes answerHash;
    }

    function getTokenMetadata(
        uint256 _tokenId
    ) external view returns (Metadata memory);
}
