//Añadimos una constante que es la aerolinea
const Airline = artifacts.require('Airline');

//Creamos una instancia
let instance;

//Cada vez que se ejecute vamos a crear una instancia nueva de la arolinea
beforeEach(async () => {
    instance = await Airline.new()
});

//Comenzamos el train teniendo el contrato de la aerolinea
contract('Airline', accounts => {

    //Vamos a comprobar que hay vuelos disponibles
    it('should have available flights', async() => {
        //Dejamos en total la instancia de la función totalFlights()
        let total = await instance.totalFlights();
        //Comparamos para que se nos de el resultado del test
        assert(total>0);
    });


    //Comprobamos que los clientes pueden comprar un vuelo cuando se le pasa el valor correcto
    it('should alllow customers to buy a flight providing its value', async() => {
        //Cogemos un vuelo y de el el nombre y el precio
        let flight = await instance.flights(0);
        let flightName = flight[0], price = flight[1];
        //Sacamos por pantalla los datos del vuelo
        console.log(flight);

        //Creamos una instancia para comprar un vuelo desde el primer account y pasandole el valor del precio
        await instance.buyFlight(0,{from:accounts[0], value: price});
        //Cogemos el primer vuelo del account
        let customerFlight = await instance.customerFlights(accounts[0],0);
        //Conseguimos el total de vuelos que tiene el cliente
        let customerTotalFlights = await instance.customerTotalFlights(accounts[0]);
        //Los mostramos
        console.log(customerFlight,customerTotalFlights);

        //comprobamos que los datos son correctos
        assert(customerFlight[0],flightName);
        assert(price, customerFlight[1]);
        assert(customerTotalFlights,1);
    });

    //Comprobamos que no se puede comprar un avion si le pasamos menos de lo que vale
    it ('should not allow customers to buy flights under the price', async ()=> {
        let flight = await instance.flights(0);
        let price = flight[1]-5000;
        //Intentamos comprar el vuelo 
        try{
            await instance.buyFlight(0,{from: accounts[0],value: price});
        }
        //Si no nos deja pues devolvemos un error
        catch (e){
            return;
        }
        assert.fail();
    });

    //Nos debería dar el balance de la aerolinea en ese contrato
    it('Airline should get the real balance of the contract', async()=>{

        //Lo que hacemos es comprar dos vuelos y comparar que el precio de estos sea igual al total de dinero que tiene el contrato
        let flight = await instance.flights(0);
        let price = flight[1];

        let flight2 = await instance.flights(1);
        let price2 = flight2[1];

        await instance.buyFlight(0, {from: accounts[0], value: price});
        await instance.buyFlight(1, {from: accounts[1], value: price2});

        let newAirlineBalance = await instance.getAirlineBalance();

        assert.equal(newAirlineBalance.toNumber(), price.toNumber()+price2.toNumber());
    });

    //Debería dejar que le devuelva los loyalty points a cada usuario
    it('should allow customers to redeem loyalty points', async()=>{

        //Compramos un vuelo y cogemos los loyalty points para el usuario y comprobamos que el balance final es mayor que el que tenía al comprar el vuelo
        let flight = await instance.flights(1);
        let price = flight[1];

        await instance.buyFlight(1,{from: accounts[0], value: price});

        let balance = await web3.eth.getBalance(accounts[0]);
        await instance.redeemLoyaltyPoints({from: accounts[0]});
        let finalBalance = await web3.eth.getBalance(accounts[0]);

        let customer = await instance.customers(accounts[0]);
        let loyaltyPoints = customer[0];

        assert(loyaltyPoints,0);
        assert(finalBalance>balance);
    })
});