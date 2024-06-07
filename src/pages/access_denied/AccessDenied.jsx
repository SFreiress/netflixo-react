import React from "react";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { Image } from "primereact/image";
import Logo from '../../assets/ADS2K22.png'

export default function AccessDenied(){
    const navigate = useNavigate();

    return(
        <div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                <h1 alignContent="center">Você não tem acesso a essa página!</h1>
                <p style={{ fontSize: '20px' }}>Parece que você não realizou login para acessar essa página. Realize o login e tente novamente.</p>
                <Button label="Realizar Login" onClick={() => navigate('/')}/>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <Image src={Logo} alt="Logo" height="300px" />
                </div>
            </div>
        </div>
    )
}