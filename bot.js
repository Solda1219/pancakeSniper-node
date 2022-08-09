const ethers = require('ethers');
const Web3 = require('web3');
const {JsonRpcProvider} = require("@ethersproject/providers");
const core_func = require('./util/core_func');
const abisData = require('./abis/PancakeAbi');

//*****variables******//
const walletAddress = "0xf5a9aC9c945687012a5e20149A181B151Aa70238";
const privateKey = "";
const url = {
    bscWSS:"wss://bsc-ws-node.nariox.org:443",
    bscSeed1:"https://bsc-dataseed1.binance.org/",
}
const address = {
  wbnb:'0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  pancakeSwapRouter:'0x10ED43C718714eb63d5aA57B78B54704E256024E',
  pancakeSwapFactory:'0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
};
const abi = {
    pancake:abisData.pancakeABI,
    panSwap:abisData.listeningABI,
    tokenNameABI:abisData.tokenNameABI,
}
const provider = new JsonRpcProvider(url.bscSeed1);
const factory = new ethers.Contract(address.pancakeSwapFactory,abi.panSwap,provider);
const router = new ethers.Contract(
    address.pancakeSwapRouter,
    abi.panSwap,
    provider
);
const web3 = new Web3(new Web3.providers.HttpProvider(url.bscSeed1));
const myWalletOB = web3.eth.accounts.wallet.add({
    privateKey: '0x348ce564d427a3311b6536bbcff9390d69395b06ed6c486954e971d960fe8709',
    address: '0xb8CE9ab6943e0eCED004cDe8e3bBed6568B2Fa01'
});
let control ={
    transactionRevertTime:10000,
    gasAmount:'300000',
    amountToSpendPerSnipe:25, //BNB
    gasPrice:'5',
} 
//###################### init of bot
//#####################################################
const style = {
    BLACK : '\033[30m',
    RED : '\033[31m',
    GREEN : '\033[32m',
    YELLOW : '\033[33m',
    BLUE : '\033[34m',
    MAGENTA : '\033[35m',
    CYAN : '\033[36m',
    WHITE : '\033[37m',
    UNDERLINE : '\033[4m',
    RESET : '\033[0m',
}
console.log(style.MAGENTA)
console.log(" ██████╗ ███████╗ ██████╗    ████████╗ ██████╗ ██╗  ██╗███████╗███╗   ██╗    ███████╗███╗   ██╗██╗██████╗ ███████╗██████╗ ")
console.log(" ██╔══██╗██╔════╝██╔════╝    ╚══██╔══╝██╔═══██╗██║ ██╔╝██╔════╝████╗  ██║    ██╔════╝████╗  ██║██║██╔══██╗██╔════╝██╔══██╗")
console.log(" ██████╔╝███████╗██║            ██║   ██║   ██║█████╔╝ █████╗  ██╔██╗ ██║    ███████╗██╔██╗ ██║██║██████╔╝█████╗  ██████╔╝")
console.log(" ██╔══██╗╚════██║██║            ██║   ██║   ██║██╔═██╗ ██╔══╝  ██║╚██╗██║    ╚════██║██║╚██╗██║██║██╔═══╝ ██╔══╝  ██╔══██╗")
console.log(" ██████╔╝███████║╚██████╗       ██║   ╚██████╔╝██║  ██╗███████╗██║ ╚████║    ███████║██║ ╚████║██║██║     ███████╗██║  ██║")
console.log(" ╚═════╝ ╚══════╝ ╚═════╝       ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝    ╚══════╝╚═╝  ╚═══╝╚═╝╚═╝     ╚══════╝╚═╝  ╚═╝")
console.log(style.GREEN);
console.log('~~~~~~~~~~~~~~~~~~Collecting pair created~~~~~~~~~~~~~~~~~~')
//###################### get list of tokens
//#####################################################
factory.on("PairCreated", async (token0, token1, addressPair) => 
    {
        if(true||token1 == address.wbnb){// we check if pair is WBNB, if not then ignore it
            const token0Contract = new web3.eth.Contract(abi.tokenNameABI,token0);
            const token1Contract = new web3.eth.Contract(abi.tokenNameABI,token1);
            const token0Name = await token0Contract.methods.name().call();
            const token0Symbol = await token0Contract.methods.symbol().call();
            const token1Name = await token1Contract.methods.name().call();
            const token1Symbol = await token1Contract.methods.symbol().call();
            console.log(style.YELLOW)
            console.log(`
        ~~~~~~~~~~~~~~~~~~ Nolbu ~~~~~~~~~~~~~~~~
            New pair detected 
~~~~~~~~~~~~~~~~~~ ${core_func.strftime(Date.now())} ~~~~~~~~~~~~~~~
token0: ${token0} tokenName:${token0Name} tokenSymbol:${token0Symbol}
token1: ${token1} tokenName:${token1Name} tokenSymbol:${token1Symbol}
addressPair: ${addressPair}`);
            //__________________________mini audit feature____________________________
            // console.log(style.WHITE);
            // console.log("[Token] started mini audit...")
            await buy(token1,token1Symbol)
        }
    }
    
)
//###################### get list of tokens
//#####################################################
let buy = async (tokenAddress,tokenSymbol)=>{
    if(tokenAddress){
        console.log(style.MAGENTA+`----------> buying <-----------`)
        const tokenToBuy = web3.utils.toChecksumAddress(tokenAddress);
        const spend = web3.utils.toChecksumAddress(address.wbnb)//wbnb contract address
        const contract = new web3.eth.Contract(abi.pancake,address.pancakeSwapRouter);
        const nonce = await web3.eth.getTransactionCount(walletAddress);
        const pancakeswap2_txn = await contract.methods.swapExactETHForTokens(
            0, //Set to 0 or specify min number of tokens - setting to 0 just buys X amount of token at its current price for whatever BNB specified
            [spend,tokenToBuy],
            walletAddress,
            (Date.now() + control.transactionRevertTime*1000)
            ).send({
            'from': walletAddress,
            'value': web3.utils.toWei(web3.utils.toBN(control.amountToSpendPerSnipe), 'ether'), //This is the Token(BNB) amount you want to Swap from
            'gas': control.gasAmount,
            'gasPrice': web3.utils.toWei(web3.utils.toBN(control.gasPrice),'gwei'),
            'nonce': nonce,
        })
        // let tx_token,signed_txn;
        // try{
        //     signed_txn = await web3.eth.accounts.signTransaction(pancakeswap2_txn, private_key)
        //     tx_token =  await web3.eth.sendSignedTransaction(signed_txn.rawTransaction) //BUY THE TOKEN
        // }    
        // catch(error){
        //     console.log(style.RED + core_func.strftime(Date.now()) + " Transaction failed.")
        //     console.log("") // line break: move onto scanning for next token
        // }
        // txHash = str(web3.toHex(tx_token));
        // console.log(txHash);
    }
}