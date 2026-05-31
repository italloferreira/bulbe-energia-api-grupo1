const enviar = document.getElementsByClassName("btn-finalizar")[0];

enviar.addEventListener("click", () => {
    const dados = {
        nome: document.getElementById("nome").value,
        endereco: document.getElementById("endereco").value,
        cep: document.getElementById("cep").value,
        cpf: document.getElementById("cpf").value,
        celular: document.getElementById("celular").value,
        email: document.getElementById("email").value
    };

    const dadosJSON = JSON.stringify(dados);

    localStorage.setItem('dadosEntrega', dadosJSON);

})



// Função para deixar cada palavra com a primeira letra maiúscula
function letraMaiuscula(texto) {
    return texto
        .toLowerCase()
        .replace(/(?:^|\s)\S/g, (letra) => letra.toUpperCase());
}

// Máscara de CEP
function mascaraCEP(valor) {
    return valor
        .replace(/\D/g, '')
        .replace(/^(\d{5})(\d)/, '$1-$2')
        .slice(0, 9);
}

// Máscara de CPF
function mascaraCPF(valor) {
    return valor
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .slice(0, 14);
}

// Máscara de celular
function mascaraCelular(valor) {
    return valor
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{5})(\d{4})$/, '$1-$2')
        .slice(0, 15);
}

// Aplica as máscaras nos campos
document.getElementById('nome').addEventListener('input', (e) => {
    e.target.value = letraMaiuscula(e.target.value);
});

document.getElementById('cep').addEventListener('input', (e) => {
    e.target.value = mascaraCEP(e.target.value);
});

document.getElementById('cpf').addEventListener('input', (e) => {
    e.target.value = mascaraCPF(e.target.value);
});

document.getElementById('celular').addEventListener('input', (e) => {
    e.target.value = mascaraCelular(e.target.value);
});

document.getElementById('email').addEventListener('input', (e) => {
    e.target.value = e.target.value.toLowerCase();
});
