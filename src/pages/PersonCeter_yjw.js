import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Space, Button, List, Divider } from 'antd';
import { web3, sellerABI, ECR20Contract, buyGoodContract } from "../contract/contractUtils_yjw";


const PersonCeter = () => {
  const [menuData, setMenuData] = useState([]);
  const [ethValue, setEthValue] = useState(0);
  const [erc20Value, setErc20Value] = useState("");
  const navigate = useNavigate();
  const userInfo = {
    username: window.localStorage.getItem("username") || "匿名用户",
    account: window.localStorage.getItem("account") || "未知账号",
    // ... 其他用户信息，如代币数量和ETH余额  
  };

  const getValueOfEth = async () => {

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    // 处理登录逻辑
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    const valEthInWei = await web3.eth.getBalance(account);
    const valEth = web3.utils.fromWei(valEthInWei, 'ether');
    const formattedEth = parseFloat(valEth).toFixed(2);

    setEthValue(formattedEth);
    const erc20Val = await ECR20Contract.methods.balanceOf(account).call();
    const erc20ValEth = web3.utils.fromWei(erc20Val, 'ether') * 200;
    setErc20Value(erc20ValEth);

  }
  //购买的商品列表
  const getGoodList = async () => {
    const menuData = [];
    var buyerAddress = window.localStorage.getItem("buyerAddress");
    var goodListId = await buyGoodContract.methods.getGoodList().call({ from: userInfo.account });
    for (let i = 1; i <= goodListId.length; i++) {
      var goodlist = await buyGoodContract.methods.getBuyGoodById(i).call({ from: userInfo.account });
      console.log(goodlist[0])
      console.log(buyerAddress)
      if (goodlist[0] === buyerAddress) {
        var goodId = goodlist[1];
        var total = goodlist[3].toString();
        var quantity = goodlist[4].toString();
        var timestamp = Number(goodlist[5]);
        let date = new Date(timestamp * 1000);
        // 获取年月日时分秒  
        let year = date.getFullYear();
        let month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，所以要加1，并使用padStart填充0  
        let day = date.getDate().toString().padStart(2, '0');
        let hours = date.getHours().toString().padStart(2, '0');
        let minutes = date.getMinutes().toString().padStart(2, '0');
        let seconds = date.getSeconds().toString().padStart(2, '0');
        // 拼接日期和时间字符串  
        let formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        var sellerContract = new web3.eth.Contract(sellerABI, goodlist[2]);
        var goodInfo = await sellerContract.methods.getProductInfoById(goodId).call({ from: userInfo.account });
        menuData.push({
          goodId: goodId,
          buyerAddress: goodlist[0],
          sellerAddress: goodlist[2],
          goodName: goodInfo[1],
          total: total,
          quantity: quantity,
          image: goodInfo[6],
          time: formattedDateTime
        });
        setMenuData(menuData);
      }
    }

  }
  useEffect(() => {
    getValueOfEth()
    getGoodList()
    console.log("----------effect-----------")
    //发送请求到后端获取菜单数据

    return () => { //退出组件执行
      console.log("----------return-----------")
    };
  }, []);

  const getSwapTokensForEth = async () => {
    try {
      const receipt = await ECR20Contract.methods.swapTokensForEth().send({ from: userInfo.account, value: web3.utils.toWei('10', 'ether'), gas: 5000000 });
      console.log(receipt)
      const erc20Val = await ECR20Contract.methods.balanceOf(userInfo.account).call();
      setErc20Value(erc20Val.toString());
      const valEthInWei = await web3.eth.getBalance(userInfo.account);
      const valEth = web3.utils.fromWei(valEthInWei, 'ether');
      const formattedEth = parseFloat(valEth).toFixed(2);
      setEthValue(formattedEth);
    } catch (err) {
      console.log(err)
      alert(err)
    }

  }

  return (
    <div style={{}}>
      <Divider orientation="left" style={{ fontSize: '30px' }}>个人中心</Divider>
      <div style={{ color: '#000000' }}>
        <h3>用户姓名：{userInfo.username}</h3>
      </div>
      <div style={{ color: '#000000' }}>
        <h3>登录账号：{userInfo.account}</h3>
      </div>
      <div style={{ color: '#000000' }}>
        <h3>代币余额：{erc20Value} erc</h3>
      </div>
      <div style={{ color: '#000000' }}>
        <h3>ETH余额:{ethValue}eth</h3>
      </div>
      <div style={{ color: '#000000' }}>
        <Button type="primary" onClick={getSwapTokensForEth}>兑换代币</Button>
        {/* 这里可以添加代币数量和ETH余额的展示 */}
      </div>
      <Divider type="vertical" style={{ height: '100%' }} />
      <Divider orientation="left">购买记录</Divider>
      <List
        itemLayout="horizontal"
        dataSource={menuData}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={"https://gateway.pinata.cloud/ipfs/" + item.image} />}
              title={<a>{item.goodName}</a>}
              description={
                <div>
                  <p>购买数量：{item.quantity}</p>
                  <p>总消费：{item.total}</p>
                  <p>下单时间：{item.time}</p>
                </div>}
            />
            <List.Item.Meta
              style={{ float: 'right' }}
              description={<Button type="primary" onClick={
                () => {
                  navigate(`/api/1/goodsCommont/${item.goodId}`)
                  window.localStorage.setItem("sellerAddress", item.sellerAddress);
                  // window.localStorage.setItem("buyerAddress",item.buyerAddress);
                }
              }>商品评价</Button>}
            />
          </List.Item>
        )}
      />
    </div>


  )

};
export default PersonCeter;