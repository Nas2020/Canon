// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Utility {
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    modifier onlyEndorser() {
        require(NYMs[msg.sender].role == 2, "Not an endorser");
        _;
    }

    struct NYM {
        uint8 role;
        uint8 version;
        string endpoint;
    }
    mapping(address => NYM) public NYMs;

    struct SCHEMA {
        address schema_owner;
        address trust_registry;
        uint8 version;
        bytes20 schema_id;
        string name;
        string[] attributes;
    }
    mapping(bytes20 => SCHEMA) public SCHEMAs;

    struct CRED_DEF {
        address cred_def_owner;
        address trust_registry;
        address revocation_registry;
        uint8 signature;
        bytes20 cred_def_id;
        bytes20 schema_id;
        string tag;
    }
    mapping(bytes20 => CRED_DEF) public CRED_DEFs;

    constructor() {
        owner = msg.sender;
        NYMs[owner] = NYM(2, 1, "http://canon.ca");
    }

    function registerNYM(
        address _dest,
        uint8 _role,
        uint8 _version,
        string memory _endpoint
    ) public onlyEndorser {
        require(NYMs[_dest].role == 0, "NYM already exists");
        NYMs[_dest] = NYM(_role, _version, _endpoint);
        emit NYMRegistered(_dest,_role, _version, _endpoint);
    }

    function registerSchema(
        address _schema_owner,
        address _trust_registry,
        uint8 _version,
        string calldata _name,
        string[] calldata _attributes
    ) public onlyEndorser returns (bytes20) {
        bytes20 _schema_id = ripemd160(bytes(abi.encode(_name)));
        require(SCHEMAs[_schema_id].version == 0, "Schema ID already exists");
        SCHEMAs[_schema_id] = SCHEMA(
            _schema_owner,
            _trust_registry,
            _version,
            _schema_id,
            _name,
            _attributes
        );
        emit SchemaRegistered(_schema_id, _name);
        return _schema_id;
    }

    function registerCredDef(
        address _cred_def_owner,
        address _trust_registry,
        address _revocation_registry,
        uint8 _signature,
        bytes20 _schema_id,
        string calldata _tag
    ) public onlyEndorser returns (bytes20) {
        require(SCHEMAs[_schema_id].version != 0, "Schema does not exist");
        bytes20 _cred_def_id = ripemd160(bytes(abi.encode(_tag)));
        require(
            CRED_DEFs[_cred_def_id].signature == 0,
            "CredDef ID already exists"
        );
        CRED_DEFs[_cred_def_id] = CRED_DEF(
            _cred_def_owner,
            _trust_registry,
            _revocation_registry,
            _signature,
            _cred_def_id,
            _schema_id,
            _tag
        );
        emit CredDefRegistered(_cred_def_id, _tag);
        return _cred_def_id;
    }

    function getNYM(address _dest) public view returns (NYM memory) {
        return NYMs[_dest];
    }

    function getSCHEMA(bytes20 _schema_id) public view returns (SCHEMA memory) {
        return SCHEMAs[_schema_id];
    }

    function getCredDef(
        bytes20 _cred_def_id
    ) public view returns (CRED_DEF memory) {
        return CRED_DEFs[_cred_def_id];
    }

    // Events
    event NYMRegistered(address indexed account, uint8 role, uint8 version, string endpoint);
    event SchemaRegistered(bytes20 indexed schemaID, string name);
    event CredDefRegistered(bytes20 indexed credDefID, string tag);
    
}
