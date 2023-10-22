// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./ICustomERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract AnswerNFTMarketplace is IERC721Receiver, Ownable, Pausable {
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    address public marketplaceAddress;
    address public nftContractAddress;
    uint256 public marketplaceFee;

    struct NFTListing {
        address seller;
        uint256 price;
    }

    mapping(uint256 => NFTListing) public listings;

    constructor(
        address _marketplaceAddress,
        uint256 _marketplaceFee,
        address _nftContractAddress
    ) Ownable(msg.sender) {
        marketplaceAddress = _marketplaceAddress;
        marketplaceFee = _marketplaceFee;
        nftContractAddress = _nftContractAddress;
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function listNFT(uint256 tokenId, uint256 price) public {
        require(
            IERC721(nftContractAddress).ownerOf(tokenId) == msg.sender,
            "You do not own this NFT"
        );
        ICustomERC721(nftContractAddress).safeTransferFrom(
            msg.sender,
            address(this),
            tokenId
        );
        listings[tokenId] = NFTListing({seller: msg.sender, price: price});
    }

    function buyNFT(uint256 tokenId, bytes memory answer) public payable {
        require(
            listings[tokenId].seller != address(0),
            "NFT is not listed for sale"
        );
        require(
            listings[tokenId].price >= msg.value,
            "Incorrect payment amount"
        );

        ICustomERC721.Metadata memory tokenMetadata = ICustomERC721(
            nftContractAddress
        ).getTokenMetadata(tokenId);
        require(
            bytes32(tokenMetadata.answerHash) == keccak256(answer),
            "AnswerHash Does Not Match!"
        );

        address seller = listings[tokenId].seller;
        uint256 salePrice = listings[tokenId].price;
        uint256 feeAmount = (salePrice * marketplaceFee) / 100;

        payable(marketplaceAddress).transfer(feeAmount);
        payable(seller).transfer(salePrice - feeAmount);
        IERC721(nftContractAddress).safeTransferFrom(
            address(this),
            msg.sender,
            tokenId
        );
    }

    function withdrawNFT(uint256 tokenId) public {
        require(
            listings[tokenId].seller == msg.sender,
            "You do not own this NFT or it is not listed for sale"
        );
        delete listings[tokenId];
        IERC721(nftContractAddress).safeTransferFrom(
            address(this),
            msg.sender,
            tokenId
        );
    }

    function getAllListings() public view returns (NFTListing[] memory) {
        uint256 totalListings = listings.length; // Adjust this as per your contract

        // Create an array to store the listings
        NFTListing[] memory allListings = new NFTListing[](totalListings);

        // Iterate through the mapping and populate the array
        for (uint256 i = 0; i < totalListings; i++) {
            allListings[i] = listings[i];
        }

        return allListings;
    }
}
