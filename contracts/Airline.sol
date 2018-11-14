pragma solidity ^0.4.24;

//Creamos el contrato 
contract Airline {
    
    //creamos la variable address owner donde almacenaremos al sender
    address public owner;

    //Creamos el customer con sus características
    struct Customer {
        uint loyaltyPoints;
        uint totalFlights;
    }

    //Creamos el vuelo con sus características.
    struct Flight {
        string name;
        uint price;
    }

    //Creamos una variable en la que cada punto son 0.15 eth
    uint etherPerPoint = 0.15 ether;

    //Creamos un array de vuelos
    Flight[] public flights;

    //Hacemos los mapping con el address de los compradores, los vuelos comprados por cada dirección y el numero total de vuelos.
    mapping(address => Customer) public customers;
    mapping(address => Flight[]) public customerFlights;
    mapping(address => uint) public customerTotalFlights;

    // Creamos un evento cuando se compra un vuelo
    event FlightPurchased(address indexed customer, uint price, string flight);

    //En el constructor metemos el owner y agregamos 3 vuelos a nuestro array
    constructor(){
        owner = msg.sender;
        flights.push(Flight('Tokio',4 ether));
        flights.push(Flight('Germany',3 ether));
        flights.push(Flight('Madrid',3 ether));
    }

    //La función buyFlight pasa un index indicando el vuelo 0,1,2. Se lo damos al vuelo y el value enviado debe ser igual al precio del vuelo establecido.
    function buyFlight(uint flightIndex) public payable {
        Flight flight = flights[flightIndex];
        require(msg.value == flight.price);

        //añadimos un comprador y le damos los puntos y los vuelos
        Customer storage customer = customers[msg.sender];
        customer.loyaltyPoints += 5;
        customer.totalFlights += 1;
        customerFlights[msg.sender].push(flight);
        customerTotalFlights[msg.sender]++;

        //El evento anteriormente creado
        FlightPurchased(msg.sender,flight.price,flight.name);

    }

    //Devuelve el total de vuelos que hay 
    function totalFlights() public view returns(uint){
        return flights.length;
    }

    //Da los loyalty points al usuario en caso de quererlos y los asigna a 0
    function redeemLoyaltyPoints() public {
        Customer storage customer = customers[msg.sender];
        uint etherToRefund = etherPerPoint * customer.loyaltyPoints;
        msg.sender.transfer(etherToRefund);
        customer.loyaltyPoints = 0; 
    }

    //Da los puntos totales que tiene
    function getRefundableEther() public view returns (uint){
        return etherPerPoint * customers[msg.sender].loyaltyPoints;
    }

    //Da el balance de la aerolinea
    function getAirlineBalance() public view returns(uint){
        address airlineAddress = this;
        return airlineAddress.balance;

    }

    //Solo en el caso de que sea owner
    modifier isOwner(){
        require(msg.sender == owner);
        _;
    }

}