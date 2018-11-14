import Web3 from 'web3';
import { resolve } from 'path';
import { rejects } from 'assert';

const getWeb3 = () => {
    //Vamos a cargar cada vez que entremos en la página web3 en el caso de que exista lo resolvemos y en el caso de que no damos el error.
    return new Promise((resolve,reject)=>{
        window.addEventListener('load',function(){
            let web3 = window.web3;

            if(typeof web3 !== undefined){
                web3 = new Web3(web3.currentProvider);
                resolve(web3);
            }else{
                this.console.error('No provider found, please install Metamask');
                reject();
            }
        });
    });
};

export default getWeb3;