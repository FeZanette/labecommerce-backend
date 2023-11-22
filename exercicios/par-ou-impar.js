const escolherNumero = (parOuImpar, numero) => {
  // const numeros = [0, 1, 2, 3, 4, 5]
  const computerNumber = Math.floor(Math.random() * (5 - 0 + 1));
  const soma = Number(numero) + computerNumber;
  const resultado = soma % 2 === 0;

  if (resultado && parOuImpar === "par") {
    console.log(
      `Você escolheu par e o computador escolheu ímpar. O resultado foi ${soma}. Você ganhou!`
    );
  }
  if (!resultado && parOuImpar === "par") {
    console.log(
      `Você escolheu par e o computador escolheu ímpar. O resultado foi ${soma}. Você perdeu!`
    );
  }
  if (resultado && parOuImpar === "impar") {
    console.log(
      `Você escolheu ímpar e o computador escolheu par. O resultado foi ${soma}. Você perdeu!`
    );
  }
  if (!resultado && parOuImpar === "impar") {
    console.log(
      `Você escolheu ímpar e o computador escolheu par. O resultado foi ${soma}. Você ganhou!`
    );
  }
};

escolherNumero(process.argv[2], process.argv[3])
