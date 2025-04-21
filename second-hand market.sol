// SPDX-License-Identifier: MIT  
pragma solidity ^0.8.8;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Utils {

    function stringToBytes32(string memory source)  internal pure  returns (bytes32 result) {
        assembly {
            result := mload(add(source, 32))
        }
    }




function bytes32ToString(bytes32 x)  internal pure returns (string memory) {
        bytes memory bytesString = new bytes(32);
        uint charCount = 0;
        for (uint j = 0; j < 32; j++) {
            
            bytes1 char = bytes1(bytes32(uint(x) * 2 ** (8 * j)));
            if (char != 0) {
                bytesString[charCount] = char;
                charCount++;
            }
        }
        bytes memory bytesStringTrimmed = new bytes(charCount);
        for (uint j = 0; j < charCount; j++) {
            bytesStringTrimmed[j] = bytesString[j];
        }
        return string(bytesStringTrimmed);
    } 
     

    
    function compareStrings (string memory a, string memory b) internal pure returns (bool) {
       return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
   }
}
contract ERC20 is IERC20 {
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    string public name;
    string public symbol;
    uint8 public decimals;
    address owner;
    modifier onlyOwner() {
        require(msg.sender == owner, "BasicAuth: only owner  is authorized.");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        owner = msg.sender;
    }

    function transfer(address recipient, uint256 amount)
        external
        returns (bool)
    {
        balanceOf[msg.sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    function transferBytx(address recipient, uint256 amount)
        external
        returns (bool)
    {
        balanceOf[tx.origin] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(tx.origin, recipient, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool) {
        allowance[sender][msg.sender] -= amount;
        balanceOf[sender] -= amount;
        balanceOf[recipient] += amount;
        emit Transfer(sender, recipient, amount);
        return true;
    }

    function _mint(address to, uint256 amount) internal {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }

    function _burn(address from, uint256 amount) internal {
        balanceOf[from] -= amount;
        totalSupply -= amount;
        emit Transfer(from, address(0), amount);
    }

    /*function mint(address to, uint256 amount) external onlyOwner{
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }*/
    // 添加一个事件来记录代币兑换（Swap）
    event TokenSwapped(
        address indexed from,
        uint256 amount,
        uint256 ethReceived
    );

    // 允许合约接收ETH的函数
    receive() external payable {
        // 这里只是简单地存储ETH，你可以添加逻辑来与代币进行交换
    }

    // 兑换代币（这里简化为与合约所有者交换ETH）
    function swapTokensForEth() external payable {
        // 假设有一个外部逻辑来确定ETH的等价量（例如，通过DEX的查询）
        // 这里我们简单地使用一个硬编码的汇率作为示例
        uint256 ethAmount = (msg.value / 1e18) * 100; // 假设100代币 = 1 ETH
        uint256 amount = msg.value;
        // 从合约中住铸造代币
        _mint(msg.sender, ethAmount);
        // 触发事件
        emit TokenSwapped(owner, amount, ethAmount);
    }

    // 事件，用于记录转账
    event EtherTransferred(
        address indexed from,
        address indexed to,
        uint256 amount
    );
    //放置重入攻击
    bool private isProcessing = false;

    // 转账方法
    function transferEtherTo(uint256 _amount) external {
        //  _to = payable  msg.sender;

        // 确保合约有足够的余额
        require(address(this).balance >= _amount / 100, "Insufficient balance");
        //确保可提取的钱
        require(balanceOf[msg.sender] >= _amount, "you not have ength balance");
        isProcessing = true;
        // 发送ETH
        bool success = (payable(address(msg.sender))).send(
            (_amount / 100) * 1e18
        );
        //销毁
        _burn(msg.sender, _amount);
        require(success, "Transfer failed");
        isProcessing = false;
        // 触发事件
        emit EtherTransferred(address(this), msg.sender, _amount);
    }
}
contract BuyerList is Utils{
    address[] public buyerList;//store the address of contract
    mapping(address=>address) public creatorBuyerMap;//map the creator's address to the CarOwner contract's address
    uint public buyerIdCounter; // 新增计数器来跟踪下一个可用的id 
    ERC20 erc20;
    constructor(address payable _erc20) {
        erc20 = ERC20(_erc20);
    }
    function createBuyer(string memory userName,string memory password,bool gender,string memory phone)
    public {
        address buyerAccount = msg.sender;
        require(isNotRegistered(buyerAccount));
        uint newBuyerId = ++buyerIdCounter;  
        address newBuyer = address(new Buyer(buyerAccount,newBuyerId,userName,password,gender,phone,erc20));
        buyerList.push(newBuyer);
        creatorBuyerMap[buyerAccount] = newBuyer;
    }

    function isNotRegistered(address account) internal view returns (bool) {
        return creatorBuyerMap[account]== address(0);//if account hasn't create contract,the mapping's default value is 0
    }

    function verifyPwd(string memory userName,string  memory password) public view returns (bool,uint) {
        address creator = msg.sender;
        require(!isNotRegistered(creator));
        address contractAddr = creatorBuyerMap[creator];
        Buyer buyer = Buyer(contractAddr);
        bool pwdMatches = compareStrings(buyer.userName(), userName) && buyer.pwdRight(password);  
        uint buyerId = buyer.newBuyerId();  
        return (pwdMatches,buyerId);
    }
    function getBuyerList() public view returns (address[] memory) {
        return buyerList;
    }

    function isBuyerOwner(address ownerAddr) public view returns (bool) {
        for(uint i = 0; i < buyerList.length; i++) {
            if(ownerAddr==buyerList[i]) return true;
        }
        return false;
    }
}
contract Buyer is Utils{
    uint[] public   buyGoodIds;//购买记录ID
    address public owner;//who create the contract through register
    uint public newBuyerId;
    string public userName;
    bytes32 private password;
    uint private nowBalance;
    bool public gender;
    string public phone;
    ERC20 erc20;

    modifier ownerOnly {
        require(msg.sender==owner);
        _;
    }

    modifier ownerOrSystemOnly {
        require(msg.sender==owner );
        _;
    }

      constructor(address _owner,uint _newBuyerId,string memory _userName,string memory _pwd,bool _gender,string memory _phone,ERC20 _erc20)  {  
        owner = _owner;
       newBuyerId= _newBuyerId;
        userName = _userName;
        password = stringToBytes32(_pwd);
        nowBalance = 10000;
        gender = _gender;
        phone = _phone;
        erc20 = _erc20;
    }

    function pwdRight(string memory _pwd) public view returns (bool) {
        return password==stringToBytes32(_pwd);
    }

    function getBalance() public view ownerOrSystemOnly returns (uint) {
        return nowBalance;
    }

    function modifyOwnerInfo(string  memory _userName,bool _gender,string  memory _phone) public ownerOnly {
        userName = _userName;
        gender = _gender;
        phone = _phone;
    }

    function updateBalance(int increment) public ownerOrSystemOnly {
        require((int(nowBalance)+increment)>=0);
        nowBalance = uint(int(nowBalance) + increment);
    }

    function updatePassword(string memory newPwd) public ownerOnly {
        password = stringToBytes32(newPwd);
    }

    function getOwnerInfo() public view returns(string memory ,bool,string memory){
        return (userName,gender,phone);
    }
    function addBuyGoodsId(uint buyGoodId) public {
       buyGoodIds.push(buyGoodId);
    } 
    function getBuyGoodsId() public view returns (uint[] memory){
        return buyGoodIds;
    }
}
contract SellerList is Utils {
    address[] public sellerList;
    mapping(address=>address) public creatorSellerMap;//in web3.js get the corresponding contract addr through CompanyList(account)
    // mapping(address => uint) public sellerIdToAddress; // 新增映射来存储id到地址的映射  
    uint public sellerIdCounter; // 新增计数器来跟踪下一个可用的id 
    function createSeller(string memory userName,string memory password,bool gender,string memory phone ) public {
        address sellerAccount = msg.sender;
        require(isNotRegistered(sellerAccount));
        uint newSellerId = ++sellerIdCounter;  
        address newSeller = address(new Seller(sellerAccount,newSellerId,userName,password,gender,phone));
        sellerList.push(newSeller);
        creatorSellerMap[sellerAccount] = newSeller;
        // sellerIdToAddress[newSellerId] = newSeller;  
    }

    function getSellerList() public view returns (address[] memory){
        return sellerList;
    }

    function isNotRegistered(address account) internal view returns (bool) {
        return creatorSellerMap[account]== address(0);//if account hasn't created contract,the mapping's default value is 0
    }

    function isSeller(address sellerAddr) public view returns (bool) {
        for(uint i = 0; i < sellerList.length; i++) {
            if(sellerAddr==sellerList[i]) return true;
        }
        return false;
    }

    function verifyPwd(string  memory userName,string memory password) public view returns (bool,uint) {
        address creater = msg.sender;
        require(!isNotRegistered(creater));
        address contractAddr = creatorSellerMap[creater];
        Seller seller = Seller(contractAddr);
        bool pwdMatches = compareStrings(seller.userName(),userName)&&seller.pwdRight(password);
        uint sellerId = seller.newSellerId();
        return (pwdMatches,sellerId);
    }
}
contract Seller is Utils {
    address public owner; //who create the company by registering as a company
    uint public newSellerId;
    string public userName;
    bytes32 private password;
    uint private nowBalance;
    bool public gender;
    string public phone;
    
    constructor(address _owner,uint _newSellerId,string memory _userName,string memory _password,bool _gender,string memory _phone)  {
        owner = _owner;
        newSellerId= _newSellerId;
        userName = _userName;
        password = stringToBytes32(_password);
        nowBalance = 10000;
        gender = _gender;
        phone = _phone;
       
    }

    modifier ownerOnly {
        require(owner==msg.sender);
        _;
    }

     modifier ownerOrSystemOnly {
        require(msg.sender==owner);
        _;
    }

    function modifySellerInfo(string  memory _userName,string memory _phone) public ownerOnly {
        userName = _userName;
        phone = _phone;
        
    }

    function updatePassword(string memory newPwd) public ownerOnly{
        password = stringToBytes32(newPwd);
    }

    function pwdRight(string  memory _pwd) public view returns (bool) {
        return password==stringToBytes32(_pwd);
    }

    function updateBalance(int increment) public ownerOrSystemOnly{
        require((int(nowBalance)+increment) > 0);
        nowBalance = uint(int(nowBalance) + increment);
    }

    function getBalance() public view ownerOrSystemOnly returns (uint){
        return nowBalance;
    }

    function getSellerInfo() public view returns (string memory ,string memory) {
        return (userName,phone);
    }
   


    uint[] public productIds;
    mapping(uint=>Product) products;
    struct Product {
        uint Id;
        string productName;
        string description;
        uint price;
        uint quantity;
        bool onSale;
        bool isValid;
        string imageHash;
        string classes;
        uint timestamp; 
    }
      
    function addProduct(string memory productName,string memory description,uint price, uint quantity, string memory imageHash,string memory classes) public ownerOnly{
        uint nowProductId = productIds.length>0?productIds[productIds.length-1]+1:1;
        productIds.push(nowProductId);
        products[nowProductId].Id = nowProductId;
        products[nowProductId].productName = productName;
        products[nowProductId].description = description;
        products[nowProductId].price = price;
        products[nowProductId].quantity = quantity;
        products[nowProductId].onSale = true;
        products[nowProductId].isValid = true;
        products[nowProductId].imageHash = imageHash;
        products[nowProductId].classes = classes;
        products[nowProductId].timestamp = block.timestamp;
    }


    function getProductIds() public view returns (uint[] memory) {
        return productIds;
    }

    function getProductInfoById(uint productId) public view returns (uint,string memory,string memory,uint,uint,bool,string memory,string memory,uint){
        require(existProduct(productId));
        Product storage product = products[productId];
        return (product.Id,product.productName,product.description,product.price,product.quantity,product.onSale,product.imageHash,product.classes,product.timestamp);
    }

    function existProduct(uint productId) internal view returns (bool) {
        return products[productId].isValid;
    }
    function updateQuantity(uint productId,uint quantity) public ownerOrSystemOnly returns(bool){
       require(existProduct(productId));
       Product storage product = products[productId];
       product.quantity -= quantity;
      if (product.quantity == 0){
          product.onSale = false;
        }
        return product.onSale;
    }
}
contract BuyGoodList {
    uint[] goodList;
    mapping(uint=>BuyGood) buyGoods;
    ERC20 erc20;

    constructor(address payable _erc20) {
        erc20 = ERC20(_erc20);
    }
    struct BuyGood {
        uint Id;
        address buyer;
        uint buyerId;
        address seller;
        uint goodId;
        uint quantity;
        uint total;
        uint timestamp; 
        uint Balance;//store the money temporerily from carOwner or from company for accident payout
        bool isValid;
    }

    function getGoodList() public view returns (uint[] memory){
        return goodList;
    }

    function getBuyGoodByGoodId(uint goodId) public view returns (uint,address,uint,address,uint,uint,uint,uint){
             require(existGood(goodId));
             BuyGood storage buyGood = buyGoods[goodId];
             return (buyGood.Id,buyGood.buyer,buyGood.buyerId,buyGood.seller
                     ,buyGood.goodId,buyGood.quantity,buyGood.total,buyGood.Balance);
     }
    function getBuyGoodById(uint buyGoodId) public  view returns (address,uint,address,uint,uint,uint){
        BuyGood storage buyGood = buyGoods[buyGoodId];
        return (buyGood.buyer,buyGood.goodId,buyGood.seller,buyGood.total,buyGood.quantity,buyGood.timestamp);
    }



    function existGood(uint goodId) internal view returns (bool) {
        return buyGoods[goodId].isValid;//isValid==true means such record exists
    }

    function addBuyGood(address buyer,uint buyerId,address seller,uint goodId,uint quantity,uint price) public{
        Buyer buyerContract = Buyer(buyer);
        require(msg.sender==buyerContract.owner());
        uint total = price * quantity;
        require(erc20.balanceOf(msg.sender) >= total);
        erc20.transferBytx(address(msg.sender), total);
        uint nowBuyGoodId = goodList.length>0?goodList[goodList.length-1]+1:1;
        goodList.push(nowBuyGoodId);
        buyGoods[nowBuyGoodId].Id = nowBuyGoodId;
        buyGoods[nowBuyGoodId].buyer = buyer;
        buyGoods[nowBuyGoodId].buyerId = buyerId;
        buyGoods[nowBuyGoodId].seller = seller;
        buyGoods[nowBuyGoodId].goodId = goodId;
        buyGoods[nowBuyGoodId].quantity = quantity;
        buyGoods[nowBuyGoodId].total = total;
        buyGoods[nowBuyGoodId].Balance = price;
        buyGoods[nowBuyGoodId].isValid = true;
        buyGoods[nowBuyGoodId].timestamp = block.timestamp;
    }
     function getLastBuyGoodId() public view returns(uint) {
         return goodList[goodList.length-1];
     }



}
contract Evaluete {
    uint[] public commontIds;
    mapping(uint=>Commont) commonts;
    struct Commont {
        uint Id;
        uint roleIds;
        address buyer;
        address seller;
        uint productId;
        string score;
        string description;
        string imageHash;
        bool isValid;
    }
      
    function addCommont(uint roleIds,address buyer,address seller,uint productId,string memory score,string memory description, string memory imageHash) public {
        uint nowCommontId = commontIds.length>0?commontIds[commontIds.length-1]+1:1;
        commontIds.push(nowCommontId);
        commonts[nowCommontId].Id = nowCommontId;
        commonts[nowCommontId].roleIds = roleIds;
        commonts[nowCommontId].buyer = buyer;
        commonts[nowCommontId].seller = seller;
        commonts[nowCommontId].productId = productId;
        commonts[nowCommontId].score = score;
        commonts[nowCommontId].description = description;
        commonts[nowCommontId].imageHash = imageHash;
        commonts[nowCommontId].isValid = true;
    }
   function getCommontIds() public view returns (uint[] memory) {
        return commontIds;
    }
    function getCommontInfoById(uint commontId) public view returns (uint,uint,address,address,uint,string memory,string memory,string memory){
        require(existCommont(commontId));
        Commont storage commont = commonts[commontId];
        return (commont.Id,commont.roleIds,commont.buyer,commont.seller,commont.productId,commont.score,commont.description,commont.imageHash);
    }
    function existCommont(uint commontId) internal view returns (bool) {
        return commonts[commontId].isValid;
    }
}
contract Reports {
    uint[] public reportIds;
    mapping(uint=>Report) reports;
    struct Report {
        uint Id;
        address buyer;
        address seller;
        uint productId;
        string classes;
        string description;
        bool isValid;
    }
      
    function addReport(address buyer,address seller,uint productId,string memory classes,string memory description) public {
        uint nowReportId = reportIds.length>0?reportIds[reportIds.length-1]+1:1;
        reportIds.push(nowReportId);
        reports[nowReportId].Id = nowReportId;
        reports[nowReportId].buyer = buyer;
        reports[nowReportId].seller = seller;
        reports[nowReportId].productId = productId;
        reports[nowReportId].classes = classes;
        reports[nowReportId].description = description;
        reports[nowReportId].isValid = true;
    }
   function getReportIds() public view returns (uint[] memory) {
        return reportIds;
    }
    function getReportInfoById(uint reportId) public view returns (uint,address,address,uint,string memory,string memory){
        require(existReport(reportId));
        Report storage report = reports[reportId];
        return (report.Id,report.buyer,report.seller,report.productId,report.classes,report.description);
    }
    function existReport(uint reportId) internal view returns (bool) {
        return reports[reportId].isValid;
    }
}
