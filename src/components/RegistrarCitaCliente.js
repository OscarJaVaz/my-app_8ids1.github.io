import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import QRCode from 'react-qr-code';
import axios from 'axios';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import SaveIcon from '@mui/icons-material/Save';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Cita from './assets/cita2.png';
import Modal from '@mui/material/Modal';
import Backdrop from '@mui/material/Backdrop';
import Fade from '@mui/material/Fade';

function RegistrarCitaCliente() {
  const navigate = useNavigate();
  const location = useLocation();

  const [cita, setCita] = useState({
    id: 0,
    paciente: '',
    doctor: '',
    enfermedad: '',
    fecha: '',
    hora: ''
  });

  const [loading, setLoading] = useState(false);
  const [doctores, setDoctores] = useState([]);
  const [enfermedades, setEnfermedades] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [qrData, setQRData] = useState('');
  const [confirmacionVisible, setConfirmacionVisible] = useState(false);
    // Obtener la fecha de hoy en formato ISO (AAAA-MM-DD)
    const fechaHoy = new Date().toISOString().split('T')[0];

  const fnObtenerDatos = async () => {
    if (location.state && location.state.id) {
      await axios.get('http://127.0.0.1:8000/api/cita', {
        params: {
          id: location.state.id
        }
      }).then((response) => {
        console.log(response.data);
        setCita(response.data);
        setLoading(false);
      });
    } else {
      console.error("No se encontró el ID en location.state");
    }
  };

  const fnObtenerDoctores = async () => {
    await axios.get('http://127.0.0.1:8000/api/doctores')
      .then((response) => {
        setDoctores(response.data);
      });
  };

  const fnObtenerEnfermedades = async () => {
    await axios.get('http://127.0.0.1:8000/api/enfermedades')
      .then((response) => {
        setEnfermedades(response.data);
      });
  };

  const handleGuardar = (event, value) => {
    const { name, value: fieldValue } = event.target;
    const newValue = value || fieldValue;
    setCita((prevState) => ({
      ...prevState,
      [name]: newValue,
    }));
  };

  const generarQR = () => {
    const qrCodeData = JSON.stringify(cita);
    setQRData(qrCodeData);
    setOpenModal(true);
  };

  const GuardarDatos = async () => {
    setLoading(true);
    await axios.post('http://127.0.0.1:8000/api/cita/crear', {
      ...cita,
      codigo_qr: qrData
    });
    console.log('Datos guardados correctamente');
    setLoading(false);
    setConfirmacionVisible(true);
    setTimeout(() => {
      navigate('/cliente');
    }, 2000);
  };

  const regresar = () => {
    navigate('/cliente');
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  useEffect(() => {
    console.log('Render');
    fnObtenerDatos();
    fnObtenerDoctores();
    fnObtenerEnfermedades();
  }, []);

  const camposCompletos = () => {
    return (
      cita.paciente.trim() !== '' &&
      cita.doctor.trim() !== '' &&
      cita.enfermedad.trim() !== '' &&
      cita.fecha.trim() !== '' &&
      cita.hora.trim() !== ''
    );
  };

  return (
    <div
      style={{
        margin: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '130vh',
        width: '440px',
        background: '#DEDFEF',
        borderRadius: '50px',
      }}
    >
      <h1 style={{ marginBottom: '10px' }}>Citas</h1>
      <img src={Cita} style={{ height: '18%', width: '25%' }} alt="Imagen de cita" />
      <ul style={{ listStyleType: 'none', textAlign: 'center', padding: 0 }}>
        <p></p>
        <li>
          <TextField
            label="Paciente"
            name="paciente"
            value={cita.paciente}
            onChange={(event, value) => handleGuardar(event, value?.nombre)}
          />
        </li>
        <p></p>
        <li>
          <Autocomplete
            options={doctores}
            getOptionLabel={(option) => option.nombre}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                id="combo-box-demo"
                label="Doctor"
                name="doctor"
                value={cita.doctor}
                onChange={(event, value) => handleGuardar(event, value?.nombre)}
              />
            )}
            value={doctores.find((d) => d.nombre === cita.doctor) || null}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        </li>
        <p></p>
        <li>
          <Autocomplete
            options={enfermedades}
            getOptionLabel={(option) => option.nombre}
            renderInput={(params) => (
              <TextField
                {...params}
                required
                id="combo-box-demo"
                label="Enfermedad"
                name="enfermedad"
                value={cita.enfermedad}
                onChange={(event, value) => handleGuardar(event, value?.nombre)}
              />
            )}
            value={enfermedades.find((e) => e.nombre === cita.enfermedad) || null}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        </li>
        <p></p>
        <li>
          <TextField
            required
            id="outlined-required"
            label="Fecha"
            name="fecha"
            type="date"
            value={cita.fecha}
            onChange={handleGuardar}
            // Establecer el atributo min con la fecha de hoy
            inputProps={{ min: fechaHoy }}
          />
        </li>
        <p></p>
        <li>
          <TextField
            required
            id="outlined-required"
            label="Hora"
            name="hora"
            type="time"
            value={cita.hora}
            onChange={handleGuardar}

          />
        </li>
        <p></p>
        <Button
          variant="contained"
          style={{ backgroundColor: 'green', marginRight: '10px' }}
          onClick={generarQR}
          startIcon={<SaveIcon />}
          disabled={!camposCompletos()}
        >
          Generar QR
        </Button>

        <br /><br />
        <Button
          variant="contained"
          style={{ backgroundColor: '#F66E10' }}
          onClick={regresar}
          startIcon={<ArrowBackIosIcon />}
        >
          Regresar
        </Button>

        <br /><br />
        {loading ? <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box> : ''}
        <Modal
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={openModal}>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', maxWidth: '80vw', margin: 'auto' }}>
              <QRCode value={qrData} size={256} />
              <Button variant="contained" color="primary" onClick={handleCloseModal}>Cerrar</Button>
              <Button variant="contained" color="primary" onClick={GuardarDatos}>Registrar cita</Button>
            </div>
          </Fade>
        </Modal>
        <Modal
          open={confirmacionVisible}
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={confirmacionVisible}>
            <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', maxWidth: '80vw', margin: 'auto' }}>
              <h2 id="transition-modal-title">¡Cita registrada!</h2>
              <p id="transition-modal-description">¡Tu cita se ha registrado exitosamente!</p>
            </div>
          </Fade>
        </Modal>
      </ul>
    </div>
  );
}

export default RegistrarCitaCliente;
