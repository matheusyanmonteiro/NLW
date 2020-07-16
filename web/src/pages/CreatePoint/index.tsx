import React, {useEffect, useState, ChangeEvent} from 'react'
import {Link} from 'react-router-dom';
import {FiArrowLeft} from 'react-icons/fi';
import {Map, TileLayer, Marker} from 'react-leaflet';
import axios from 'axios';
import api from '../../services/api';

import './styles.css';

import logo from '../../assets/logo.svg'

//lembrar que no back end coloquei name ao inves de title interface que pega campos do back end
interface Item {
    id: number;
    name: string;
    image_url: string;
}

//Interfaces que pega os campos necessarios da api do ibge
interface IBGEUFResponse {
    sigla: string;
}
interface IBGECITYResponse {
    nome: string;
}


const CreatePoint = () => {

    //Pegando items do back end localhost 3333 estado
    const [items, setItems] = useState<Item[]>([]);
    //Estado para armazenar as UFS
    const [ufs, setUfs] = useState<string[]>([]);
    //Estado para armazenar as cidades
    const [cities, setCities] = useState<string[]>([]);

    //Estados para saber se foi alterada alguma coisa
    const [seletedUf, setSelectedUf] = useState('0');

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        })
    }, []);

    // APi de Estados e cidades
    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla);
            
            setUfs(ufInitials);
        });
    },[]); 

    useEffect(() => {
       if (seletedUf === '0'){
           return;
       }
       axios.get<IBGECITYResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${seletedUf}/municipios`).then(response => {
            const cityNames = response.data.map(city => city.nome);
            
            setCities(cityNames);
        });
    }, [seletedUf]);

    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>){
       const uf = event.target.value;
       
       setSelectedUf(uf);

    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>

                <Link to = "/">
                    <FiArrowLeft/>
                    Voltar para a Home
                </Link>
            </header>

            <form>
                <h1>Cadastro do ponto de coleta</h1>
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                            type="text"
                            name="name"
                            id="name"
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input 
                                type="email"
                                name="email"
                                id="email"
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                            />
                        </div>
                    </div>
                </fieldset>

                

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço do mapa</span>
                    </legend>

                    <Map center = {[-27.2092052, -49.6401092]} zoom = {15}>
                    <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position = {[-27.2092052, -49.6401092]} />
                    </Map>


                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estados (UF)</label>
                            <select 
                                name="uf"
                                id="uf"
                                value ={seletedUf}
                                onChange = {handleSelectUf}
                             >
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                   <option key = {uf} value={uf}>{uf}</option> 
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city">
                                <option value="0">Selecione uma Cidade</option>
                                {cities.map(city => (
                                   <option key = {city} value={city}>{city}</option> 
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                
                <fieldset>
                    <legend>
                        <h2>Ítens de Coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>

                    <ul className = "items-grid">
                        {items.map(item => (
                            <li key = {item.id}>
                              <img src= {item.image_url} alt={item.name}/>
                              <span>{item.name}</span>
                          </li>
                        ))}
                      

                    </ul>
                </fieldset>

                <button type = "submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>

    )
};

export default CreatePoint;