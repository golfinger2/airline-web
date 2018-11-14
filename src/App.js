import React, { Component } from "react";
import Panel from "./Panel";
import getWeb3 from "./getWeb3";
import AirlineContract from './airline';
import airline from "./airline";
import {airlineService, AirlineService} from "./airlineService";
import { ToastContainer} from "react-toastr";

//Para transformar los wei a ether
const converter = (web3)=>{
    return (value) => {
        return web3.utils.fromWei(value.toString(),'ether');
    }
}

export class App extends Component {

    constructor(props) {
        super(props);
        //Hay que inicializar los estados siempre en react
        //Siempre estan en mayusculas pero metamask lo guarda en mayuscula
        this.state = {
            account: undefined,
            balance : 0,
            flights: [],
            customerFlights: [],
            refundableEther: 0
        };
    }
//Importamos web3 de getWeb3 lo instanciamos y llamamos a los accounts
    async componentDidMount(){
        this.web3 = await getWeb3();
        //Creamos la instancia de la aerolinea
        this.airline = await AirlineContract(this.web3.currentProvider);
        this.toEther = converter(this.web3);
        this.airlineService = new AirlineService(this.airline);
        var account = (await this.web3.eth.getAccounts())[0];

        //Suscribirse a un evento
        let flightPurchased = this.airline.FlightPurchased();
        flightPurchased.watch(function(err,result){

            const{customer,price,flight} = result.args;

            //Atento a las comillas que son la inversa de la normal
            if(customer === this.state.account){
                console.log(`You purchased a flight to ${flight} with a cost of ${price}`);
            }else{
                this.container.success(`Las customer purchased a flight to ${flight} with a cost of ${price}`,'Flight information');
            }

        }.bind(this));



        //Para poder ver los cambios sin necesidad de refrescar al cambiar de cuenta o realizar alguna operacion
        this.web3.currentProvider.publicConfigStore.on('update',async function(event){
            this.setState({
                account: event.selectedAddress.toLowerCase()
            },()=>{
                this.load();
            });
        }.bind(this));

        //Tiene dos argumentos asi que ademas de añadir el account tenemos que cargarlo, lo guardamos en el estado del componente.
        this.setState ({
            account: account.toLowerCase()
        },()=>{
            this.load();
        });
    }

    async getBalance() {
        let weiBalance = await this.web3.eth.getBalance(this.state.account);
        this.setState({
            balance: this.toEther(weiBalance)
        });
    }

    async getFlights(){
        let flights = await this.airlineService.getFlights();
        this.setState({
            flights
        });
    }

    async getRefundableEther(){
        let refundableEther = this.toEther(await this.airlineService.getRefundableEther(this.state.account));
        this.setState({
            refundableEther
        });
    }

    async refundLoyaltyPoints(){
        await this.airlineService.redeemLoyaltyPoints(this.state.account);
    }

    async getCustomerFlights(){
        let customerFlights = await this.airlineService.getCustomerFlights(this.state.account);
        this.setState({
            customerFlights
        });
    }

    //Creamos la funcion comprar vuelo y la instanciamos con el index, el account y el precio ya recogido
    async buyFlight(flightIndex,flight){
        await this.airlineService.buyFlight(flightIndex,
            this.state.account,
            flight.price);
    }

    //Creamos el load
    async load(){
        this.getBalance();
        this.getFlights();
        this.getCustomerFlights();
        this.getRefundableEther();
    }

    render() {
        return <React.Fragment>
            <div className="jumbotron">
                <h4 className="display-4">Welcome to the Airline!</h4>
            </div>

            <div className="row">
                <div className="col-sm">
                    <Panel title="Balance">
                        <p><strong>{this.state.account}</strong></p>
                        <span><strong>Balance:</strong> {this.state.balance}</span>

                    </Panel>
                </div>
                <div className="col-sm">
                    <Panel title="Loyalty points - refundable ether">
                        <span>{this.state.refundableEther} eth</span>
                        <button className = 'btn btn-sm btn-success text-white'onClick={this.refundLoyaltyPoints.bind(this)}>Refund </button>
                    </Panel>
                </div>
            </div>
            <div className="row">
                <div className="col-sm">
                    <Panel title="Available flights">
                        {this.state.flights.map((flight,i) => {
                            return <div key={i}>
                                        <span>{flight.name} - cost: {this.toEther(flight.price)}</span>
                                        <button className='btn btn-sm btn-success text-white' onClick={() => this.buyFlight(i,flight)}>Purchase</button>
                                    </div>
                        })}


                    </Panel>
                </div>
                <div className="col-sm">
                    <Panel title="Your flights">
                        {this.state.customerFlights.map((flight,i) =>{
                            return <div key={i}>
                                {flight.name} - cost: {flight.price}
                            </div>
                        })}

                    </Panel>
                </div>
            </div>
            <ToastContainer ref={(input) => this.container = input}
                className="toast-top-right" />
        </React.Fragment>
    }
}