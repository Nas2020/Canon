// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Utility {
    string private data;

    function setData(string memory _data) public {
        data = _data;
    }

    function getData() public view returns (string memory) {
        return data;
    }
}
