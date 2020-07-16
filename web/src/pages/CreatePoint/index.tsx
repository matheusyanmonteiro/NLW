import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react'
import {Link} from 'react-router-dom';
import {FiArrowLeft} from 'react-icons/fi';
import {Map, TileLayer, Marker} from 'react-leaflet';
import axios from 'axios';
import {LeafletMouseEvent} from 'leaflet';
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
    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');

    //Estados para colher informações sobre o mapa lt e lg
    const [selectedPosition, setSelectedPosition] = useState<[number,number]>([0, 0]);
    //Estado para pegar a posição atual do mapa
    const [initialPosition, setInitialPosition] = useState<[number,number]>([0, 0]);

    //Estado para salvar os dados do formulario
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    });

    //estado para salvar os dados de items no formulario
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    //buscando dentro da api.ts toda a api construida para items de dentro do back-end
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
       if (selectedUf === '0'){
           return;
       }
       axios.get<IBGECITYResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
            const cityNames = response.data.map(city => city.nome);
            
            setCities(cityNames);
        });
    }, [selectedUf]);

    //Efect para inciar a api do mapa no ponto geolocalizado pelo computador
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude, longitude} = position.coords;
            setInitialPosition([latitude,longitude]);
        });
    },[]);

    //Funções que guaradram e auxiliaram o banco de dados a enviar uf e cidades
    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>){
       const uf = event.target.value;
       setSelectedUf(uf);
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){
        const city = event.target.value;
        setSelectedCity(city);
    }
    //Função para pegar latitude longitude no mapa
    function handleMapClick(event: LeafletMouseEvent){
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng,
        ])
    }
    //Função para pegar os inputes do formulario
    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const {name, value} = event.target;
        setFormData({...formData, [name]: value})

    }
    //Função para saber quando o usuario clicou em algum item 
    function handleSelectItem(id: number){
        const alreadySelected = selectedItems.findIndex(item => item === id);

        if (alreadySelected >= 0) {
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);

        
        } else {
            setSelectedItems([...selectedItems, id]);
        }
        
    }

    //Função para submeter o formulario
    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const {name, email, whatsapp } =formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] =selectedPosition;
        const items = selectedItems;

        const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        };
        console.log(data);
        await api.post('points',data);

        alert ('ponto criado');
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

            <form onSubmit = {handleSubmit}>
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
                            onChange = {handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input 
                                type="email"
                                name="email"
                                id="email"
                                onChange = {handleInputChange}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange = {handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço do mapa</span>
                    </legend>

                    <Map center = {initialPosition} zoom = {15} onClick = {handleMapClick}>
                    <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position = {selectedPosition} />
                    </Map>


                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estados (UF)</label>
                            <select 
                                name="uf"
                                id="uf"
                                value ={selectedUf}
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
                            <select
                                name="city"
                                id="city"
                                value = {selectedCity}
                                onChange = {handleSelectCity}
                             >
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
                            <li
                                key = {item.id}
                                onClick = {() => handleSelectItem(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                            >
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