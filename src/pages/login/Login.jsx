import React, { useContext, useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { AuthContext } from '../../context/AuthContext';
import { Image } from "primereact/image";
import Logo from '../../assets/ADS2K22.png'

export default function Login(){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const toast = useRef(null);

    const showError = () => {
        toast.current.show({
          severity: 'error', summary: 'Erro', detail: "Erro ao realizar login!", life: 3000,
        });
      };

    const handleLogin = async () => {
        const data = {
            username,
            password,
        };
        await login({ ...data });
        if (!localStorage.getItem('authenticated')){
            showError();
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '90vh' }}>
            <div><Toast ref={toast} /></div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <div style={{ alignContent: 'center' }}>
                        <Image src={Logo} alt="Logo" height="200px" />
                    </div>
                    <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
                        <span className="p-float-label">
                            <InputText id="Email" value={username} onKeyDown={(e) => e.key === 'Enter' ? handleLogin() : null} onChange={(e) => setUsername(e.target.value)} />
                            <label htmlFor="username">Email</label>
                        </span>
                        <span className="p-float-label">
                            <Password value={password} onKeyDown={(e) => e.key === 'Enter' ? handleLogin() : null} onChange={(e) => setPassword(e.target.value)} feedback={false} tabIndex={1} />
                            <label htmlFor="password">Senha</label>
                        </span>
                        <Button rounded icon="pi pi-sign-in" label="Entrar" style={{ alignSelf: 'end' }} onClick={() => handleLogin()} />   
                    </div>
                </div>
            </div>
            <p style={{ opacity: '0.5' }}>*Powered by ADS2K22</p>
        </div>
    )
}