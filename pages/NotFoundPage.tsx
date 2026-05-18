import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    Swal.fire({
      title: 'Página não encontrada',
      text: 'A página que procura não existe ou foi movida.',
      icon: 'error',
      confirmButtonText: 'Voltar ao início',
    }).then(() => {
      navigate('/dashboard');
    });
  }, [navigate]);

  return null; // We don't render anything because we use SweetAlert2
};

export default NotFoundPage;
