// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

/// @custom:security-contact sakshambisen123@gmail.com
contract AnswerNFT is
    ERC721,
    ERC721Pausable,
    Ownable,
    ERC721Burnable,
    ERC721Enumerable
{
    uint256 private _nextTokenId;
    struct Metadata {
        string ipfsHash;
        bytes answerHash;
    }
    mapping(uint256 => Metadata) tokenMetadata;

    constructor(
        address initialOwner
    ) ERC721("AnswerNFT", "ANS") Ownable(initialOwner) {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMint(
        bytes memory _answerHash,
        string memory _ipfsHash
    ) public payable {
        require(msg.value >= 0.01 ether, "Not enough minting fees sent!");
        _safeMint(msg.sender, _nextTokenId);
        tokenMetadata[_nextTokenId] = Metadata({
            ipfsHash: _ipfsHash,
            answerHash: _answerHash
        });
        _nextTokenId++;
    }

    // The following functions are overrides required by Solidity.

    function _update(
        address to,
        uint256 tokenId,
        address auth
    )
        internal
        override(ERC721, ERC721Pausable, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function getTokenMetadata(
        uint256 _tokenId
    ) public view returns (Metadata memory) {
        return tokenMetadata[_tokenId];
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        Metadata memory metadata = tokenMetadata[tokenId];
        return metadata.ipfsHash;
    }
}
