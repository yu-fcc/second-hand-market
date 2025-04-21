import React, { useState, useEffect } from 'react';
import { Avatar, List, Space,Divider } from 'antd';
import { web3, evalueteContract, buyerABI, sellerABI } from "../contract/contractUtils_yjw";




const CommontList = () => {
  const [data, setData] = useState([]);
  var role = window.localStorage.getItem("roleIds");
  console.log(role);
 
  useEffect(() => {
    console.log("----------effect-----------")
    commonts();
    return () => { //退出组件执行
      console.log("----------return-----------")
    };
  }, []); // 空数组[]表示仅在组件挂载时执行

  const commonts = async () => {
    const data = [];
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await web3.eth.getAccounts();
    var commontIdList = await evalueteContract.methods.getCommontIds().call();
    for (var i = 0; i < commontIdList.length; i++) {
      var commontInfo = await evalueteContract.methods.getCommontInfoById(commontIdList[i]).call();
      //判断是买家写的评价还是卖家写的评价
      var roleId = Number(commontInfo[1]);
      var goodId = Number(commontInfo[4]);
      console.log(goodId);
      if (roleId === 1) {
        var sellerAddress = window.localStorage.getItem("sellerAddress");
        console.log(sellerAddress);
        console.log(commontInfo[3]);
        if (sellerAddress === commontInfo[3]) {
        
          console.log(commontInfo[7]);
          var buyerContract = new web3.eth.Contract(buyerABI, commontInfo[2]);
          var buyerName = await buyerContract.methods.userName().call();
          var sellerContract = new web3.eth.Contract(sellerABI, sellerAddress);
          var goodInfo = await sellerContract.methods.getProductInfoById(goodId).call();
          var goodName = goodInfo[1];
          data.push({
            roleId: commontInfo[1],
            buyerName: buyerName,
            buyerAddress: commontInfo[2],
            sellerAddress: commontInfo[3],
            goodName: goodName,
            content: commontInfo[5],
            description: commontInfo[6],
            href: commontInfo[7],
          })
          setData(data);
        }
      } else if (roleId === 2) {
        var buyerAddress = window.localStorage.getItem("buyerAddress");
        console.log("buyer" + buyerAddress);
        console.log(commontInfo[7]);
        if (buyerAddress == commontInfo[2]) {
          console.log(roleId);
          console.log(buyerAddress);
          var sellerContract = new web3.eth.Contract(sellerABI, commontInfo[3]);
          var sellerName = await sellerContract.methods.userName().call();
          console.log(sellerName);
          var goodInfo = await sellerContract.methods.getProductInfoById(goodId).call();
          var goodName = goodInfo[1];
          console.log(goodName);
          data.push({
            roleId: commontInfo[1],
            sellerName: sellerName,
            buyerAddress: commontInfo[2],
            sellerAddress: commontInfo[3],
            goodName: goodName,
            content: commontInfo[5],
            description: commontInfo[6],
            href: commontInfo[7],
          })
          setData(data);
        }
      }
    }
    
    console.log("data:" + data);
  }




  return (
    <div>
         <Divider type="vertical" style={{ height: '100%' }} />
         <Divider orientation="left" style={{ fontSize: '30px' }}>评价列表</Divider>
      {role == 1 ?
        <List
          itemLayout="vertical"
          size="large"
          pagination={{
            onChange: (page) => {
              console.log(page);
            },
            pageSize: 3,
          }}
          dataSource={data}
          renderItem={(item) => (
            <List.Item
              key={item.title}
              extra={
                <img
                  width={230}
                  height={170}
                  alt="logo"
                  src={"https://gateway.pinata.cloud/ipfs/" + item.href}
                />
              }
            >
              <List.Item.Meta
                title={"买家名称："+item.buyerName}
                description={"买家地址："+item.buyerAddress}
              />
              {"商品名称："+item.goodName}<br />
              {"商品评分："+item.content}<br />
              {"商品评价："+item.description}
            </List.Item>
          )}
        /> 
        :
        <List
          itemLayout="vertical"
          size="large"
          pagination={{
            onChange: (page) => {
              console.log(page);
            },
            pageSize: 3,
          }}
          dataSource={data}
          renderItem={(item) => (
            <List.Item
              key={item.title}
              extra={
                <img
                  width={230}
                  height={170}
                  alt="logo"
                  src={"https://gateway.pinata.cloud/ipfs/" + item.href}
                />
              }
            >
               <List.Item.Meta
                title={"卖家名称："+item.sellerName}
                description={"卖家地址："+item.sellerAddress}
              />
              {"商品名称："+item.goodName}<br />
              {"商品评分："+item.content}<br />
              {"商品评价："+item.description}
            </List.Item>
             
          )}
        />
      }
    </div>

  );
};
export default CommontList;