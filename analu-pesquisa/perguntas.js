/* Pesquisa Ana Lu Biquínis & Fitness: perguntas (usadas pelo formulário e pelo painel de resultados) */
const CUPOM={codigo:"ANALU10",titulo:"10% OFF",regra:"na sua próxima compra",loja:"https://www.analubiquinis.com.br",validade:"Válido por 30 dias no site e no showroom."};
const ROT5={1:"Não curti",2:"Podia ser melhor",3:"Ok",4:"Gostei muito",5:"Amei 💖"};
const Q=[
 {id:"peca",sec:"A sua peça",t:"O que você levou da Ana Lu?",a:"Pode marcar mais de uma.",tipo:"multi",g2:1,op:[["👙","Biquíni"],["🩱","Maiô ou body"],["🏋️‍♀️","Conjunto fitness"],["👗","Saída de praia"],["🩳","Short ou legging"],["✨","Outra peça"]]},
 {id:"canal",sec:"A sua peça",t:"Onde você comprou?",tipo:"um",op:[["🛍️","No showroom, em BH"],["🌐","Pelo site"],["💬","Pelo WhatsApp ou Instagram"]]},
 {id:"tempo",sec:"A sua peça",t:"Há quanto tempo ela está com você?",tipo:"um",g2:1,op:[["","Menos de 1 mês"],["","De 1 a 3 meses"],["","De 3 a 6 meses"],["","Mais de 6 meses"]]},
 {id:"tamanho",sec:"Caimento",t:"Sobre o tamanho: vestiu como você esperava?",tipo:"um",op:[["✅","Serviu certinho"],["🤏","Ficou um pouco pequena"],["🫧","Ficou um pouco grande"],["🔁","Precisei trocar"]]},
 {id:"corpo",sec:"Caimento",t:"A peça valorizou o seu corpo do jeitinho que ele é?",a:"A Ana Lu nasceu para vestir mulheres com corpos reais. Conta pra gente se cumprimos.",tipo:"estrelas"},
 {id:"conforto",sec:"Caimento",t:"E o conforto? Dá pra esquecer que está vestindo?",a:"Alças, elástico, forro, firmeza.",tipo:"estrelas"},
 {id:"qualidade",sec:"Qualidade",t:"Que nota você dá para a qualidade da peça?",a:"Tecido, costura, acabamento e estampa.",tipo:"estrelas"},
 {id:"duracao",sec:"Qualidade",t:"Depois de sol, mar, cloro, treino e lavagens, como ela está?",tipo:"um",op:[["💎","Parece nova"],["👍","Só o desgaste normal de uso"],["🎨","A cor desbotou"],["🧵","Elástico ou costura cederam"],["🤷‍♀️","Ainda usei pouco pra dizer"]]},
 {id:"atendimento",sec:"A compra",t:"Como foi o nosso atendimento?",a:"Da primeira mensagem até a peça chegar em você.",tipo:"estrelas"},
 {id:"entrega",sec:"A compra",t:"E a entrega?",tipo:"um",op:[["🚀","Chegou antes do esperado"],["📦","Chegou no prazo"],["⏳","Atrasou um pouco"],["🐢","Atrasou bastante"],["🛍️","Retirei no showroom"]]},
 {id:"preco",sec:"A compra",t:"O preço faz sentido pela qualidade que você recebeu?",tipo:"um",op:[["🏆","Vale cada centavo"],["⚖️","Preço justo"],["🤏","Um pouco caro"],["💸","Caro para o que entrega"]]},
 {id:"recompra",sec:"De novo?",t:"Você compraria de novo na Ana Lu?",tipo:"um",op:[["😍","Já comprei mais de uma vez"],["✅","Com certeza"],["🤔","Talvez"],["🙅‍♀️","Acho que não"]]},
 {id:"motivo",sec:"De novo?",t:"O que faria você comprar mais vezes?",a:"Pode marcar mais de um.",tipo:"multi",op:[["🎨","Estampas e cores novas com frequência"],["📏","Mais opções no meu tamanho"],["🧩","Escolher tamanhos diferentes em cima e embaixo"],["💸","Cashback ou desconto pra quem já é cliente"],["🚚","Frete mais em conta"],["🔔","Ser avisada dos lançamentos antes de todo mundo"]]},
 {id:"proximo",sec:"De novo?",t:"O que você quer ver na próxima coleção?",a:"Pode marcar mais de um.",tipo:"multi",g2:1,op:[["🌺","Mais estampas"],["🤎","Cores lisas da moda"],["👙","Novas modelagens de biquíni"],["🩱","Maiôs e bodies"],["🏋️‍♀️","Mais fitness"],["👗","Saídas e looks de praia"]]},
 {id:"nps",sec:"Recomendação",t:"De 0 a 10, quanto você indicaria a Ana Lu para uma amiga?",tipo:"nps"},
 {id:"recado",sec:"Último passo",t:"Quer deixar um recado pra Ana Lu?",a:"Elogio, crítica ou sugestão. É opcional, mas a gente lê todos.",tipo:"texto"}
];
