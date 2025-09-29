// Função para formatar a data e hora
export const dateHook = ()=>{

function getDataHora() {
  const now = new Date();
  const pad = (n:any) => n.toString().padStart(2, '0');
  const data = `${pad(now.getDate())}${pad(now.getMonth() + 1)}${now.getFullYear()}`;
  const hora = `${pad(now.getHours())}${pad(now.getMinutes())}`;
  return { data, hora };
}




    return { getDataHora  }
}

