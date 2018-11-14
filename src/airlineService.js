//En este caso vamos a crear un nuevo file js ya que además de mostrar queremos hacer unas operaciones


export class AirlineService {
    constructor(contract){
        this.contract = contract;
    }
    //tenemos la funcion en el contrato que nos devuelve todos los vuelos
    async getTotalFlights(){
        return (await this.contract.totalFlights()).toNumber();
    }

    //Creamos la función que nos va a dar la instancia de comprar un vuelo.
    async buyFlight(flightIndex,from,value){
        return await this.contract.buyFlight(flightIndex,{from,value});
    }

    async getFlights(){
        let total = await this.getTotalFlights();
        let flights = [];
        for(var i=0;i<total;i++){
            let flight = await this.contract.flights(i);
            flights.push(flight);
        }
        return this.mapFlights(flights);
    }

    async getCustomerFlights(account){
        let customerTotalFlights = await this.contract.customerTotalFlights(account);
        let flights = [];
        for (var i=0;i<customerTotalFlights.toNumber();i++){
            let flight = await this.contract.customerFlights(account,i);
            flights.push(flight);
        }
        return this.mapFlights(flights);
    }

    getRefundableEther(from){
        return this.contract.getRefundableEther({from});
    }

    redeemLoyaltyPoints(from){
        return this.contract.redeemLoyaltyPoints({from});
    }

    //Hacemos un mapeo de los vuelos para poder mostrarlos en la web
    mapFlights(flights){
        return flights.map(flight => {
            return{
                name: flight[0],
                price: flight[1].toNumber()

            }
        });
    }
}