import React, { useContext, useEffect, useRef, useState } from "react";
import { DataTable } from 'primereact/datatable';
import AccessDenied from "../access_denied/AccessDenied";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import api from "../../services/api";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { ScrollPanel } from "primereact/scrollpanel";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { AuthContext } from "../../context/AuthContext";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { Password } from "primereact/password";

export default function Home(){
    const [admins, setAdmins] = useState(null);
    const [permissions, setPermissions] = useState(null);
    const [page, setPage] = useState(0);
    const [selectedAdmin, setSelectedAdmin] = useState({
        id: null,
        nome: null,
        username: null,
        password: null,
        permissions: []
    });
    const [password, setPassword] = useState(null);
    const [visibleEdit, setVisibleEdit] = useState(false);
    const [visibleEditPassword, setVisibleEditPassword] = useState(false);

    const toast = useRef(null);
    const { logout } = useContext(AuthContext)

    const showSuccess = (message) => {
        toast.current.show({
          severity: 'success', summary: 'Sucesso', detail: message, life: 3000,
        });
    };

    const showError = (message) => {
        toast.current.show({
          severity: 'error', summary: 'Erro', detail: message, life: 3000,
        });
    };

    const findAdmins = async (method) => {
        try {
            if (method === 'up'){
                let number = page + 1;
                setPage(number);
            } else if (method === 'down'){
                let number = page - 1;
                setPage(number);
            } else if (method === 'first'){
                setPage(0);
            } 
            const data = await api.get((method === 'up' ? 
                `/api/user?page=${page + 1}` : method === 'down' ? 
                `/api/user?page=${page - 1}` : method === 'first' ? 
                '/api/user?page=0' : `/api/user?page=${page}`),  {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            setAdmins(data.data);
        } catch (err){
            showError('Ocorreu um erro inesperado ao processar a solicitação. ' + err.response.data.message);
        }
    }

    const findPermissions = async () => {
        try {
            const data = await api.get('/api/permission', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            setPermissions(data.data);
        } catch (err) {
            showError('Ocorreu um erro inesperado ao processar a solicitação. ' + err.response.data.message);
        }
    }

    const save = async () => {
        try {
            await api.post('/api/user', selectedAdmin, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            showSuccess('Administrador cadastrado com sucesso!');
            findAdmins('page');
            setVisibleEdit(false);
            setSelectedAdmin({
                id: null,
                nome: null,
                username: null,
                password: null,
                permissions: []
            })
        } catch (err) {
            showError('Ocorreu um erro inesperado ao processar a solicitação. ' + err.response.data.message);
        }
    }

    const update = async () => {
        try {
            await api.put('/api/user', selectedAdmin, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            showSuccess('Administrador atualizado com sucesso!');
            findAdmins('page');
            setVisibleEdit(false);
            setSelectedAdmin({
                id: null,
                nome: null,
                username: null,
                password: null,
                permissions: []
            })
        } catch (err) {
            showError('Ocorreu um erro inesperado ao processar a solicitação. ' + err.response.data.message);
        }
    }

    const changePassword = async ()  => {
        try {
            await api.patch(`/api/user/changepassword/${selectedAdmin.id}`, {password}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            showSuccess('Senha do administrador atualizada com sucesso!');
            setVisibleEditPassword(false);
            setSelectedAdmin({
                id: null,
                nome: null,
                username: null,
                password: null,
                permissions: []
            });
            setPassword(null);
        } catch (err) {
            showError('Ocorreu um erro inesperado ao processar a solicitação. ' + err.response.data.message);
        }
    }

    const enableAndDesable = async (id, method) => {
        try {
            await api.patch(`/api/user/${id}/desable`, null, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            if(method === 'enable'){
                showSuccess('Administrador ativado com sucesso!');
            } else {
                showSuccess('Administrador desativado com sucesso!');
            }
            findAdmins('page');
        } catch (err) {
            showError('Ocorreu um erro inesperado ao processar a solicitação. ' + err.response.data.message);
        }
    }

    const deleteAdmin = async (id) => {
        try {
            await api.delete(`/api/user/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            showSuccess('Administrador deletado com sucesso!');
            findAdmins();
        } catch (err){
            showError('Ocorreu um erro inesperado ao processar a solicitação. ' + err.response.data.message);
        }
    }

    useEffect(() => {
        findAdmins('first');
        findPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const confirm = (message, method) => {
        confirmDialog({
          message: message,
          header: 'Confirmação',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Sim',
          rejectLabel: 'Não',
          accept: method,
        });
    };

    const dialogFooter = () => {
        return <Button label="Salvar" icon="pi pi-save" onClick={() => (selectedAdmin.id === null ? save() : (password === null ? update() : changePassword()))}
        disabled={selectedAdmin.nome === null || selectedAdmin.username === null || selectedAdmin.password === null || selectedAdmin.permissions.length === 0} />
    }
    
    const dialogEdit = () => {
        return (
            <Dialog footer={dialogFooter} visible={visibleEdit} header={selectedAdmin.id === null ? "Cadastrar administrador" : "Editar administrador"} 
            onHide={() => {setVisibleEdit(false); setSelectedAdmin({id: null, nome: null, username: null, password: null, permissions: []})}} style={{ width: '50%', height: '60%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '25px', width: '100%', height: '100%' }}>
                    <span className="p-float-label">
                        <InputText id="Nome" value={selectedAdmin.nome} onChange={(e) => setSelectedAdmin(prevState => ({...prevState, nome: e.target.value}))} />
                        <label htmlFor="Nome">Nome</label>
                    </span>
                    <span className="p-float-label">
                        <InputText autoComplete="off" value={selectedAdmin.username} onChange={(e) => setSelectedAdmin(prevState => ({...prevState, username: e.target.value}))} />
                        <label>Email</label>
                    </span>
                    <span className="p-float-label">
                        <Password autoComplete="off" value={selectedAdmin.password} onChange={(e) => setSelectedAdmin(prevState => ({...prevState, password: e.target.value}))}
                        disabled={selectedAdmin.id === null ? false : true}/>
                        <label>Senha</label>
                    </span>
                    <MultiSelect selectedItemsLabel="{0} permissões selecionadas" maxSelectedLabels="1" selectAllLabel="Todas" value={selectedAdmin.permissions}
                    onChange={(e) => setSelectedAdmin(prevState => ({...prevState, permissions: e.value}))} options={permissions} optionLabel="description" placeholder="Permissões" /> 
                </div>
            </Dialog>
        );
    }

    const dialogEditPassword = () => {
        return (
            <Dialog footer={dialogFooter} visible={visibleEditPassword} header={"Editar senha"} 
            onHide={() => {setVisibleEditPassword(false); setSelectedAdmin({id: null, nome: null, username: null, password: null, permissions: []}); setPassword(null)}}
            style={{ width: '50%', height: '60%' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                    <span className="p-float-label">
                        <Password autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)}/>
                        <label>Senha</label>
                    </span>
                </div>
            </Dialog>
        );
    }

    const headerAndFooterBody = () => {
        return (
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                <div>
                    <Button label="Cadastrar" onClick={() => setVisibleEdit(true)}/>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'end', gap: '10px' }}>
                    <Button rounded icon="pi pi-angle-double-left" disabled={page === 0 || page === 1} onClick={() => findAdmins('first')} />
                    <Button rounded icon="pi pi-angle-left" disabled={page === 0} onClick={() => findAdmins('down')} />
                    <p>{page + 1}</p>
                    <Button rounded icon="pi pi-angle-right" onClick={() => findAdmins('up')} />
                </div>
            </div>
        )
    }

    const atividadeBody = (rowData) => {
        if (rowData.enabled) {
            return <span style={{ color: 'green' }}>ATIVO</span>;
        } else {
            return <span style={{ color: 'red' }}>INATIVO</span>;
        }
    };

    const enableAndDesableBody = (rowData) => {
        if (rowData.enabled){
            return <Button rounded icon="pi pi-power-off" disabled={!localStorage.getItem('roles').includes('manager') || rowData.username === "admin@admin"}
            style={{ backgroundColor: 'red' }} onClick={() => {enableAndDesable(rowData.id, 'desable')}}/>
        } else {
            return <Button rounded icon="pi pi-power-off" disabled={!localStorage.getItem('roles').includes('manager') || rowData.username === "admin@admin"}
            style={{ backgroundColor: 'green' }} onClick={() => {enableAndDesable(rowData.id, 'enable')}}/>
        }
    }

    const editBody = (rowData) => {
        return <Button rounded icon="pi pi-pencil" disabled={!localStorage.getItem('roles').includes('manager') || rowData.username === "admin@admin"} 
            onClick={() => {setSelectedAdmin(rowData); setVisibleEdit(true)}} />
    }

    const editPasswordBody = (rowData) => {
        return <Button rounded icon="pi pi-key" disabled={!localStorage.getItem('roles').includes('manager') || rowData.username === "admin@admin"}
            onClick={() => {setSelectedAdmin(rowData); setVisibleEditPassword(true)}} />
    }

    const deleteBody = (rowData) => {
        return <Button rounded icon="pi pi-trash"  disabled={!localStorage.getItem('roles').includes('manager') || rowData.username === "admin@admin"} 
            onClick={() => confirm('Tem certeza de que deseja deletar o administrador selecionado?', () => deleteAdmin(rowData.id))} />
    }

    function tela(){
        return(
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', alignItems: 'center'}}>
                <div><Toast ref={toast} /></div>
                <div><ConfirmDialog /></div>
                <Button rounded label="Sair" icon="pi pi-sign-out" style={{ alignSelf: 'center', backgroundColor: 'red' }} onClick={() => confirm('Tem certeza de que deseja sair?', logout)} />
                <h1>Hello Word</h1>
                {dialogEdit()}
                {dialogEditPassword()}
                <Card style={{ display: 'flex', width: '96.5%', margin: '20px', height: '75%',  borderRadius: '15px', justifyContent: 'center' }}>
                    <ScrollPanel style={{ height: '65vh' }} >
                        <DataTable header={headerAndFooterBody} footer={headerAndFooterBody} value={admins} dataKey="id"
                            emptyMessage="Nenhum administrador encontrado para as filtragens selecionadas." style={{ width: '100%' }}>
                            <Column header="Nome" field="nome" />
                            <Column header="Email" field="username" />
                            <Column field={atividadeBody} />
                            <Column field={enableAndDesableBody} />
                            <Column field={editBody} />
                            <Column field={editPasswordBody} />
                            <Column field={deleteBody} />
                        </DataTable>
                    </ ScrollPanel >
                </Card>
            </div>
        )
    }
    return (localStorage.getItem('authenticated') === 'true') ? tela() : <AccessDenied />
}