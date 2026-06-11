function mostrar(id){

    let paginas = document.querySelectorAll(".pagina");

    paginas.forEach(pagina=>{
        pagina.classList.remove("ativa");
    });

    document.getElementById(id).classList.add("ativa");
}

// Cadastro simples de produto

const form = document.getElementById("produtoForm");

if(form){

    form.addEventListener("submit", function(e){

        e.preventDefault();

        alert("Produto adicionado com sucesso!");

        form.reset();

    });

}

const cupomForm = document.getElementById("cupomForm");

if(cupomForm){

    cupomForm.addEventListener("submit", function(e){

        e.preventDefault();

        const codigo =
            document.getElementById("codigo").value;

        const desconto =
            document.getElementById("desconto").value;

        const validade =
            document.getElementById("validade").value;

        const tabela =
            document.getElementById("listaCupons");

        const linha =
            document.createElement("tr");

        linha.innerHTML = `
            <td>${codigo}</td>
            <td>${desconto}%</td>
            <td>${validade}</td>
            <td>
                <button onclick="excluirCupom(this)">
                    Excluir
                </button>
            </td>
        `;

        tabela.appendChild(linha);

        cupomForm.reset();
    });
}

function excluirCupom(botao){
    botao.closest("tr").remove();
}