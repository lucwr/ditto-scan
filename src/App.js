import React, {Component} from 'react';
import Ditto from './Ditto.png';
import token from './ditto-token.png';
import './App.css';
import Navbar from './Components/Navbar';
import Countdown from './Components/Countdown';
//import Web3 from 'web3';
import {ditto_swap_address, ditto_swap_abi} from './DittoPair';
import { CSVLink} from "react-csv";
import numeral from 'numeral';
import Blacklist from './Blacklist.json';



let Web3 = require('web3');


class App extends Component {
    constructor(props) {
      super(props);
      this.state = {
        ditto_pair:[],
        firstBlock:3316992,

        toBlock:0,
        fromBlock:0,
        blocksPerDay:28800,

        start_time:0,
        end_time:0,
        lastKnownTime:0,
        
        proxyFrom:0,
        proxyTo:0,
        

        swaps:[],
        address_swaps:[],
        filter:[],
        added:[],
        sortedVolume:[],
        loading:true,

        blockError:[],
        whitelist:[],

        numberOfDays_competition:10,
        competitionStartBlock:4438000,
        lastKnownBlock:0,
        /*These values are gonna need to change for another trading competition,
        the program will automatically compute based on the given values.
         
        --numberOfDays_competition = number of days that the competition will run
        --competitionStartBlock = start block of the competition 
        */  
      }
    }

  async loadDay(){ 
 
      this.setState({
        swaps:[],
        address_swaps:[],
        filter:[],
        sortedVolume:[],
        loading:true
      })
       
        const web3 = new Web3('https://bsc-dataseed1.binance.org:443');
        const ditto_pair=  new web3.eth.Contract(ditto_swap_abi, ditto_swap_address);
        this.setState({ditto_pair:ditto_pair});
        const currentBlock = await web3.eth.getBlockNumber()
        this.setState({fromBlock:this.state.competitionStartBlock,toBlock:this.state.competitionStartBlock + (this.state.blocksPerDay * this.state.numberOfDays_competition),lastKnownBlock:currentBlock })

        const current_time = await web3.eth.getBlock(this.state.lastKnownBlock)
        const start_time = await web3.eth.getBlock(this.state.competitionStartBlock)
        let competitionDays = (this.state.blocksPerDay * this.state.numberOfDays_competition)*3

        this.setState({start_time:new Date(parseInt(start_time.timestamp,10)*1000),
                       end_time:new Date(parseInt(start_time.timestamp + competitionDays,10)*1000),
                       lastKnownTime:new Date(parseInt(current_time.timestamp,10)*1000)})

        ditto_pair.getPastEvents("Swap",{fromBlock:this.state.fromBlock, toBlock:this.state.toBlock})
        .then(events=>{
          var newest = events.concat().sort((a,b)=> b.blockNumber- a.blockNumber);
          this.setState({swaps:newest.map(value=>(value.returnValues))},()=>console.log());
            for(var i = 0; i < this.state.swaps.length;i++){
                   
                this.setState({address_swaps:[...this.state.address_swaps,{address:this.state.swaps[i].to,
                  ditto_in:this.state.swaps[i].amount0Out / 1000000000,
                  ditto_out:this.state.swaps[i].amount0In / 1000000000, 
                  total_volume:(this.state.swaps[i].amount0Out / 1000000000) + this.state.swaps[i].amount0In / 1000000000,
                  fromBlock:numeral(this.state.fromBlock).format('0,00'),
                  toBlock:numeral(this.state.toBlock).format('0,00')}]})
                
         let index = this.state.filter.findIndex(x=>x.address === this.state.address_swaps[i].address)
          if(index === -1){
            this.setState({filter:[...this.state.filter,this.state.address_swaps[i]]})
          }
      
         else{
      
          let filter=  [...this.state.filter]
          let In = this.state.filter[index].ditto_in + this.state.address_swaps[i].ditto_in
          let Out = this.state.filter[index].ditto_out + this.state.address_swaps[i].ditto_out 
          let total =  In + Out
          
           filter[index] = {address:this.state.filter[index].address, ditto_in:In,ditto_out:Out, 
                            total_volume:total,
                            fromBlock:numeral(this.state.fromBlock).format('0,00'),
                            toBlock:numeral(this.state.toBlock).format('0,00')}
      
           this.setState({filter,lastKnownBlock:currentBlock })     
         }      
        }
        
        this.setState({whitelist:this.state.filter.filter((blacklisted)=>blacklisted.address !== Blacklist.Address[1]
          && blacklisted.address !== Blacklist.Address[2]
          && blacklisted.address !== Blacklist.Address[3]
          && blacklisted.address !== Blacklist.Address[4]
          && blacklisted.address !== Blacklist.Address[5] 
          )})

        this.setState({sortedVolume:this.state.whitelist.concat().sort((a,b)=> b.total_volume - a.total_volume),loading:false})
        }).catch((err)=> this.setState({blockError:'Too Deep! Try searching smaller block difference, ie: from-block:4,000,000 to-block:4,200,000 '}))
        
        }


async loadBlockchain(){ 
 
this.setState({
  swaps:[],
  address_swaps:[],
  filter:[],
  sortedVolume:[],
  loading:true
})
 
  const web3 = new Web3('https://bsc-dataseed1.binance.org:443');
  const ditto_pair=  new web3.eth.Contract(ditto_swap_abi, ditto_swap_address);
  this.setState({ditto_pair:ditto_pair});
  const currentBlock = await web3.eth.getBlockNumber();
  this.setState({lastKnownBlock:currentBlock })

  ditto_pair.getPastEvents("Swap",{fromBlock: this.state.fromBlock, toBlock:this.state.toBlock})
  .then(events=>{
    var newest = events.concat().sort((a,b)=> b.blockNumber- a.blockNumber);
    this.setState({swaps:newest.map(value=>(value.returnValues))},()=>console.log());
      for(var i = 0; i < this.state.swaps.length;i++){
          this.setState({address_swaps:[...this.state.address_swaps,{address:this.state.swaps[i].to,
            ditto_in:this.state.swaps[i].amount0Out / 1000000000,
            ditto_out:this.state.swaps[i].amount0In / 1000000000, 
            total_volume:(this.state.swaps[i].amount0Out / 1000000000) + this.state.swaps[i].amount0In / 1000000000,
            fromBlock:numeral(this.state.fromBlock).format('0,00'),
            toBlock:numeral(this.state.toBlock).format('0,00')}]})

  
   let index = this.state.filter.findIndex(x=>x.address ===  this.state.address_swaps[i].address)
    if(index === -1){
      this.setState({filter:[...this.state.filter,this.state.address_swaps[i]]})
    }

   else{

    let filter=  [...this.state.filter]
    let In = this.state.filter[index].ditto_in + this.state.address_swaps[i].ditto_in
    let Out = this.state.filter[index].ditto_out + this.state.address_swaps[i].ditto_out 
    let total =  In + Out
    
     filter[index] = {address:this.state.filter[index].address, ditto_in:In,ditto_out:Out, 
                      total_volume:total,
                      fromBlock:numeral(this.state.fromBlock).format('0,00'),
                      toBlock:numeral(this.state.toBlock).format('0,00')}

     this.setState({filter,lastKnownBlock:currentBlock })

   }
   
  }
  
  this.setState({whitelist:this.state.filter.filter((blacklisted)=>blacklisted.address !== Blacklist.Address[1]
    && blacklisted.address !== Blacklist.Address[2]
    && blacklisted.address !== Blacklist.Address[3]
    && blacklisted.address !== Blacklist.Address[4]
    && blacklisted.address !== Blacklist.Address[5] 
    )})

  this.setState({sortedVolume:this.state.whitelist.concat().sort((a,b)=> b.total_volume - a.total_volume),loading:false})   
 
}).catch((err)=> this.setState({blockError:'Too Deep! Try searching smaller block difference, ie: from-block:4,000,000 to-block:4,200,000 '}))
  
  }


  async loadDays(){ 
 
    this.setState({
      swaps:[],
      address_swaps:[],
      filter:[],
      sortedVolume:[],
      loading:true
    })
     
      const web3 = new Web3('https://bsc-dataseed1.binance.org:443');
      const ditto_pair=  new web3.eth.Contract(ditto_swap_abi, ditto_swap_address);
      this.setState({ditto_pair:ditto_pair});
      const currentBlock = await web3.eth.getBlockNumber()
      this.setState({lastKnownBlock:currentBlock })

      ditto_pair.getPastEvents("Swap",{fromBlock:this.state.fromBlock, toBlock:this.state.toBlock})
      .then(events=>{
        var newest = events.concat().sort((a,b)=> b.blockNumber- a.blockNumber);
        this.setState({swaps:newest.map(value=>(value.returnValues))},()=>console.log());
          for(var i = 0; i < this.state.swaps.length;i++){
              this.setState({address_swaps:[...this.state.address_swaps,{address:this.state.swaps[i].to,
                ditto_in:this.state.swaps[i].amount0Out / 1000000000,
                ditto_out:this.state.swaps[i].amount0In / 1000000000, 
                total_volume:(this.state.swaps[i].amount0Out / 1000000000) + this.state.swaps[i].amount0In / 1000000000,
                fromBlock:numeral(this.state.fromBlock).format('0,00'),
                toBlock:numeral(this.state.toBlock).format('0,00')}]})
                    
       let index = this.state.filter.findIndex(x=>x.address ===  this.state.address_swaps[i].address)
        if(index === -1){
          this.setState({filter:[...this.state.filter,this.state.address_swaps[i]]})
        }
    
       else{
    
        let filter=  [...this.state.filter]
        let In = this.state.filter[index].ditto_in + this.state.address_swaps[i].ditto_in
        let Out = this.state.filter[index].ditto_out + this.state.address_swaps[i].ditto_out 
        let total =  In + Out
        
         filter[index] = {address:this.state.filter[index].address, ditto_in:In,ditto_out:Out, 
                          total_volume:total,
                          fromBlock:numeral(this.state.fromBlock).format('0,00'),
                          toBlock:numeral(this.state.toBlock).format('0,00')}
    
         this.setState({filter,lastKnownBlock:currentBlock })
    
       }
       
      }
      
    
      this.setState({whitelist:this.state.filter.filter((blacklisted)=>blacklisted.address !== Blacklist.Address[1]
        && blacklisted.address !== Blacklist.Address[2]
        && blacklisted.address !== Blacklist.Address[3]
        && blacklisted.address !== Blacklist.Address[4]
        && blacklisted.address !== Blacklist.Address[5] 
        )})

      this.setState({sortedVolume:this.state.whitelist.concat().sort((a,b)=> b.total_volume - a.total_volume),loading:false})

      }).catch((err)=> this.setState({blockError:'Too Deep! Try searching smaller block difference, ie: from-block:4,000,000 to-block:4,200,000 '}))
      
      }


  fromBlockChange = (event)=>{
    let fromBlock = event.target.value;
    this.setState({proxyFrom:fromBlock},()=>console.log())
 };

 
  toBlockChange = (event)=>{
    let toBlock = event.target.value;
    this.setState({proxyTo:toBlock},()=>console.log())
  };

  handleDaysChange = (event) => {
    if(this.state.proxyFrom === 0 || this.state.proxyFrom === ''){
      this.setState({blockError:'"From Block" field is required'})
    }
    else if(this.state.proxyFrom < this.state.firstBlock){
      this.setState({blockError:'Woah! PancakeSwap Ditto/BNB Pair starts at Block ' + this.state.firstBlock})
    } 

    else{
		this.setState({
      blockError:'',
      fromBlock:this.state.proxyFrom,
      toBlock:parseInt(this.state.proxyFrom) + parseInt(event.target.value),
		},()=>this.loadDays());

  }
}


search = (event)=>{
  
  if(this.state.proxyFrom < this.state.firstBlock || this.state.proxyTo < this.state.firstBlock){
    this.setState({blockError:'Woah! PancakeSwap Ditto/BNB Pair starts at Block ' + this.state.firstBlock})
  }

  else if(this.state.proxyFrom > this.state.proxyTo){
    this.setState({blockError:'Woah! "From-Block" is Greater than "To-Block"!'})
  }
  else{
  this.setState({ blockError:'',
                  fromBlock:this.state.proxyFrom,
                  toBlock:this.state.proxyTo,
                  blockError:''},()=>this.loadBlockchain())
  }
}

tradingCompetition = (event)=>{
this.loadDay()        
            
}

    render(){

      const headers = [
        { label: "Address", key: "address" },
        { label: "Total Volume", key: "total_volume" },
        { label: "Total Ditto Bought", key: "ditto_in" },
        { label: "Total Ditto Sold", key: "ditto_out" },
        { label: "From Block", key: "fromBlock" },
        { label: "To Block", key: "toBlock" },

      ];

  return (
    <div className="App">
      <Navbar/>
      
       <header className="App-header">
      


       <div className="row mb-3">


        <div className="form-group">
        <span className="input-title">From Block</span> 
        <input onChange={this.fromBlockChange} type="number" min="0" onKeyPress={event => {
                if (event.key === 'Enter') {
                  this.search()
                }
              }}></input>
        </div>

        <div className="form-group">
        <span className="input-title">To Block</span> 
        <input onChange={this.toBlockChange} type="number" min="0" onKeyPress={event => {
                if (event.key === 'Enter') {
                  this.search()
                }
              }}></input>
        </div>

        <div className="form-group">
        <select className="verify" onChange={this.handleDaysChange}>
              <option value={28800}> 1 Day</option>
              <option value={86400}> 3 Days</option>
              <option value={144000}> 5 Days</option>
              <option value={288000}> 10 Days</option>
          </select>
        </div>

        </div>

        
       
        <button className="search-button" onClick={this.search} >Search</button>
        <button className="search-button" onClick={this.tradingCompetition} >View Trading Competition</button>
        
        <p>{this.state.blockError}</p>

        <div className="body">
        <div className="row">
        <div className="column">
         <p className='disclaimer'>Highest Trading Volume of Ditto-BNB pair on PancakeSwap from block {numeral(this.state.fromBlock).format('0,00')} to block {numeral(this.state.toBlock).format('0,00')}</p>
         <p className='disclaimer2'>Last Known Block: {this.state.lastKnownBlock}</p>
         </div>
         </div>
         <div className="table-wrapper">
         <div> {<Countdown deadline={this.state.end_time}/>}</div>

                <table className="table-size">
               
                 
  
                 <thead>
                 <tr>
                 <th>No.</th>
                 <th>Address</th>
                 <th>Total Ditto Volume</th>
                 
                </tr>
              </thead>
              
              <tbody>
              </tbody>
                {!this.state.loading && this.state.sortedVolume.map((swaps,index)=> <tr
                 className="cursor-pointer mt-2" key={index}>  
				        <td >{index + 1}</td>   
                <td> <a href={'https://bscscan.com/address/' + swaps.address} target='blank'>{swaps.address}</a></td>     
      	        <td><div><img src={token} className="ditto-logo" border={1} alt="Ditto logo" width={20}/></div>{numeral(swaps.total_volume).format('0,00.0000')}</td>
                </tr>  )}             
              </table> 
              {this.state.loading &&<img className="loadingLogo" src={Ditto} border={1} alt="Ditto logo" width={20}></img>}
             </div>
             {!this.state.loading &&<CSVLink className='disclaimer2' data={this.state.sortedVolume} headers={headers}>Download as CSV</CSVLink>}

         </div>
     </header>
     
         

    </div>
    
  );
}

componentDidMount() {
  this._isMounted = true;
  this.loadDay();
}


}


export default App;
