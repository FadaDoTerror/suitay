import fetch from 'node-fetch';
import fs from 'fs';


    // Configurações da API SuitPay
    const ci = 'marcosdnv_1716337257024';
    const cs = '585a1db54d7c58f166de4f9ef2ff2ba889c61a69a59bd992ccdd0191d171d57b32d3506966a94ebfa1ead08f487e850b';
    let urlwebhook = `https://google.com/_functions/webhook`; // Essa é a URL para o Webhook, coloca a da Equato qunado estiver Hospedada

    const headers = {
        "ci": ci,
        "cs": cs,
        "Content-Type": "application/json"
    };
    
    // Função para gerar um QR code de pagamento
    async function gerarQrCode(nmrdarequest, datahoje, valor, cliente) {
        const url = "https://ws.suitpay.app/api/v1/gateway/request-qrcode";
        const data = JSON.stringify({
            "requestNumber": nmrdarequest, // esse numero é o da request (tem q ser de 6 digitos)
            "dueDate": datahoje,
            "amount": valor,
            "client": cliente,
            "callbackUrl": urlwebhook
        });
    
        try {
            const response = await fetch(url, {
                method: 'post',
                headers: headers,
                body: data
            });
    
            if (!response.ok) {
                throw new Error('Erro ao gerar QR Code: ' + response.statusText);
            }
    
            const result = await response.json();
            console.log('Resposta da API:', result);
    
            if (!result.paymentCodeBase64 || !result.paymentCode) {
                throw new Error('Deu erro, está faltando preencher os campos!.');
            }
    
            // Decodifica a imagem do QR Code em base64
            const qrCodeBase64 = result.paymentCodeBase64;
    
            // Salva a imagem do QR Code em um arquivo PNG
            const base64Data = qrCodeBase64.replace(/^data:image\/jpeg;base64,/, "");
            fs.writeFileSync("qrcode.png", base64Data, 'base64', function (err) {
                if (err) console.log(err);
                console.log('QR Code salvo como qrcode.png');
            });
    
            console.log('Código de Copia e Cola:', result.paymentCode);
    
            // Retorna o objeto como o utilizado no Wix
            return {
                idTransaction: result.idTransaction,
                paymentCode: result.paymentCode,
                paymentCodeBase64: qrCodeBase64
            };
    
        } catch (error) {
            console.error('Erro ao gerar QR Code:', error.message);
            throw error;
        }
    }
    
    // Exemplo de chamada da função (coloca qualquer dados OBS: TEM QUE SER VÁLIDOS!)
    gerarQrCode('654321', '2024-09-15', 25, { // a ordem é (número da request, data de hoje, valor)
        name: 'Gilson Ferreira',
        document: '28331731808',
        email: 'gilsonferreirabrito19@gmail.com'
    }).then(json => {
        console.log('Resultado:', json);
    }).catch(err => {
        console.error('Erro ao gerar QR Code:', err);
    });