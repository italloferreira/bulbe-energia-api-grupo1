// Caminhos das imagens do banner
const imagensBanner = [
    "../assets/img/banner/favoritos.png",
    "../assets/img/banner/eletronicos.png",
    "../assets/img/banner/farmacia.png"
];

// Seleciona o banner
const banner = document.getElementById("banner");

// Cria o container deslizante
const slider = document.createElement("div");
slider.classList.add("slider");
banner.appendChild(slider);

// Adiciona as imagens
imagensBanner.forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    slider.appendChild(img);
});

let indice = 0;

// Função para mover o slider
function slide() {
    indice = (indice + 1) % imagensBanner.length;
    slider.style.transform = `translateX(-${indice * 100}%)`;
}

// Troca a cada 3 segundos
setInterval(slide, 3000);
