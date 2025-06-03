
const APP_ID = "gdLMaarTYjW5yLXHj2IBuohaav58T0yAHpskS31P";
const API_KEY = "i7Vmeqefw3b9GPB2HHV3ywteZHFi9pMNAbonE0XK";

// URL base do Back4App
const BASE_URL = "https://parseapi.back4app.com/classes/Car";

// Headers padrão
const headers = {
  "X-Parse-Application-Id": APP_ID,
  "X-Parse-REST-API-Key": API_KEY,
  "Content-Type": "application/json"
};

// Elementos do DOM
const carForm = document.getElementById("carForm");
const carNameInput = document.getElementById("carName");
const carBrandInput = document.getElementById("carBrand");
const carList = document.getElementById("carList");
const carFact = document.getElementById("carFact");
const searchCarInput = document.getElementById("searchCar");
const searchResults = document.getElementById("searchResults");

// Gráfico Chart.js
const ctx = document.getElementById("carChart").getContext("2d");
let carChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: [],
    datasets: [{
      label: "Carros por Marca",
      data: [],
      backgroundColor: "rgba(59, 130, 246, 0.5)", // azul
      borderColor: "rgba(59, 130, 246, 1)",
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        precision: 0
      }
    }
  }
});

// Carregar lista e gráfico ao iniciar
window.addEventListener("DOMContentLoaded", () => {
  getCars();
  getCarFact();
});

// Função para obter lista de carros
async function getCars() {
  try {
    const response = await fetch(BASE_URL, { headers });
    const data = await response.json();
    const cars = data.results;

    // Atualizar lista no DOM
    carList.innerHTML = "";
    cars.forEach(car => {
      const li = document.createElement("li");
      li.className = "flex justify-between items-center border-b pb-1";
      li.innerHTML = `
        <span>${car.name} - ${car.brand}</span>
        <div class="space-x-2">
          <button onclick="editCar('${car.objectId}', '${car.name}', '${car.brand}')" class="text-yellow-500">Editar</button>
          <button onclick="deleteCar('${car.objectId}')" class="text-red-500">Excluir</button>
        </div>
      `;
      carList.appendChild(li);
    });

    // Atualizar gráfico
    updateChart(cars);
  } catch (error) {
    console.error("Erro ao buscar carros:", error);
  }
}

// Função para adicionar um novo carro
carForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newCar = {
    name: carNameInput.value,
    brand: carBrandInput.value
  };

  try {
    await fetch(BASE_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(newCar)
    });
    carNameInput.value = "";
    carBrandInput.value = "";
    getCars();
  } catch (error) {
    console.error("Erro ao adicionar carro:", error);
  }
});

// Função para excluir carro
async function deleteCar(id) {
  try {
    await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      headers
    });
    getCars();
  } catch (error) {
    console.error("Erro ao excluir carro:", error);
  }
}

// Função para editar carro (preenche o formulário para editar)
function editCar(id, name, brand) {
  carNameInput.value = name;
  carBrandInput.value = brand;

  // Mudar botão para "Atualizar"
  const submitBtn = carForm.querySelector("button");
  submitBtn.textContent = "Atualizar";
  submitBtn.classList.replace("bg-blue-500", "bg-green-500");

  // Alterar comportamento do formulário para atualização
  carForm.onsubmit = async (e) => {
    e.preventDefault();

    const updatedCar = {
      name: carNameInput.value,
      brand: carBrandInput.value
    };

    try {
      await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(updatedCar)
      });

      // Reset
      carForm.onsubmit = addCarHandler;
      submitBtn.textContent = "Adicionar";
      submitBtn.classList.replace("bg-green-500", "bg-blue-500");
      carNameInput.value = "";
      carBrandInput.value = "";
      getCars();
    } catch (error) {
      console.error("Erro ao atualizar carro:", error);
    }
  };
}

// Função padrão para adicionar
async function addCarHandler(e) {
  e.preventDefault();

  const newCar = {
    name: carNameInput.value,
    brand: carBrandInput.value
  };

  try {
    await fetch(BASE_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(newCar)
    });
    carNameInput.value = "";
    carBrandInput.value = "";
    getCars();
  } catch (error) {
    console.error("Erro ao adicionar carro:", error);
  }
}
carForm.onsubmit = addCarHandler;

// Atualizar gráfico Chart.js
function updateChart(cars) {
  const brandCount = {};

  cars.forEach(car => {
    brandCount[car.brand] = (brandCount[car.brand] || 0) + 1;
  });

  carChart.data.labels = Object.keys(brandCount);
  carChart.data.datasets[0].data = Object.values(brandCount);
  carChart.update();
}

// Função para buscar curiosidade aleatória (ex.: Numbers API)
async function getCarFact() {
  const randomYear = Math.floor(Math.random() * (2023 - 1950 + 1)) + 1950;
  try {
    const response = await fetch(`http://numbersapi.com/${randomYear}/year?json`);
    const data = await response.json();
    carFact.textContent = `Ano aleatório (${randomYear}): ${data.text}`;
  } catch (error) {
    console.error("Erro ao buscar curiosidade:", error);
  }
}

// Função para buscar carros na API FIPE (AGORA USANDO V2)
async function searchCars() {
  const searchTerm = searchCarInput.value.trim();

  if (!searchTerm) {
    alert("Por favor, digite um termo de busca");
    return;
  }

  // Limpa resultados anteriores e exibe mensagem de carregamento
  searchResults.innerHTML = `<p class="italic text-gray-500">Buscando carros...</p>`;

  try {
    // 1. Obter a referência de mês mais recente (necessário para a API v2)
    const referencesResponse = await fetch("https://fipe.parallelum.com.br/api/v2/references");
    if (!referencesResponse.ok) {
      throw new Error(`Erro ao buscar referências: ${referencesResponse.statusText}`);
    }
    const referencesData = await referencesResponse.json();
    if (!referencesData || referencesData.length === 0) {
        throw new Error("Nenhuma referência de mês encontrada na API FIPE.");
    }
    const latestReferenceCode = referencesData[0].code; // Pega o código da referência mais recente

    // 2. Buscar as marcas disponíveis para 'carros' com a referência mais recente
    const brandsResponse = await fetch(`https://fipe.parallelum.com.br/api/v2/cars/brands?reference=${latestReferenceCode}`);
    if (!brandsResponse.ok) {
      throw new Error(`Erro ao buscar marcas: ${brandsResponse.statusText}`);
    }
    const brands = await brandsResponse.json();

    let allResults = [];

    // Para cada marca, buscamos os modelos que correspondem ao termo de busca
    // Limitamos a 5 marcas para não sobrecarregar a API
    for (let i = 0; i < Math.min(5, brands.length); i++) {
      const brand = brands[i];
      try {
        const modelsResponse = await fetch(`https://fipe.parallelum.com.br/api/v2/cars/brands/${brand.code}/models?reference=${latestReferenceCode}`);
        if (!modelsResponse.ok) {
          console.warn(`Aviso: Erro ao buscar modelos da marca ${brand.name} (código: ${brand.code}). Status: ${modelsResponse.statusText}`);
          continue; // Pula para a próxima marca em caso de erro
        }
        const modelsData = await modelsResponse.json();

        // Filtrar modelos que correspondem ao termo de busca
        const filteredModels = modelsData.filter(model =>
          model.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Adicionar ao array de resultados
        filteredModels.forEach(model => {
          allResults.push({
            brand: brand.name,
            model: model.name
          });
        });
      } catch (error) {
        console.error(`Erro ao buscar modelos da marca ${brand.name}:`, error);
      }
    }

    // Exibir resultados
    displaySearchResults(allResults);
  } catch (error) {
    console.error("Erro na busca de carros:", error);
    searchResults.innerHTML = `<p class="text-red-500">Erro ao buscar carros: ${error.message}. Tente novamente mais tarde.</p>`;
  }
}

// Função para exibir os resultados da busca
function displaySearchResults(results) {
  if (results.length === 0) {
    searchResults.innerHTML = `<p class="italic">Nenhum carro encontrado com o termo "${searchCarInput.value}"</p>`;
    return;
  }

  searchResults.innerHTML = `
    <h3 class="font-semibold">Resultados para "${searchCarInput.value}":</h3>
    <ul class="divide-y">
      ${results.map(result => `
        <li class="py-2">
          <p class="font-medium">${result.model}</p>
          <p class="text-sm text-gray-600">${result.brand}</p>
        </li>
      `).join('')}
    </ul>
  `;
}

// Permitir busca ao pressionar Enter
searchCarInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchCars();
  }
});