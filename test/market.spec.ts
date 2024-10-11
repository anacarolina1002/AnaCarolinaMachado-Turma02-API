import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';

describe('Mercado', () => {
    const p = pactum;
    const rep = SimpleReporter;
    const baseUrl = 'https://api-desafio-qa.onrender.com';
    let mercadoId = null;

    p.request.setDefaultTimeout(30000);

    beforeAll(() => p.reporter.add(rep));
    afterAll(() => p.reporter.end());

    describe('Operações no Mercado', () => {
        it('Deve cadastrar um novo mercado', async () => {
            const response = await p
                .spec()
                .post(`${baseUrl}/mercado`)
                .expectStatus(StatusCodes.CREATED)
                .withBody({
                    cnpj: (Math.random() * 100000000000000).toFixed(0),
                    endereco: faker.location.streetAddress(),
                    nome: faker.company.name()
                })
                .returns('novoMercado.id');

            mercadoId = response;
            console.log(`Mercado cadastrado com ID: ${mercadoId}`);
        });

        it('Deve trazer todos os mercados cadastrados', async () => {
            await p
                .spec()
                .get(`${baseUrl}/mercado`)
                .expectStatus(StatusCodes.OK)
                .expectJsonLike([{
                    id: /.*/,
                    nome: /.*/,
                    endereco: /.*/,
                    cnpj: /.*/
                }]);
        });

        it('Deve trazer um mercado pelo ID', async () => {
            await p
                .spec()
                .get(`${baseUrl}/mercado/${mercadoId}`)
                .expectStatus(StatusCodes.OK);
        });

        it('Deve atualizar um mercado pelo ID', async () => {
            const updatedData = {
                cnpj: (Math.random() * 100000000000000).toFixed(0),
                endereco: faker.location.streetAddress(),
                nome: faker.company.name()
            };

            await p
                .spec()
                .put(`${baseUrl}/mercado/${mercadoId}`)
                .expectStatus(StatusCodes.OK)
                .withBody(updatedData)
                .returns('');

            console.log(`Mercado com ID ${mercadoId} atualizado.`);
        });

        it('Deve falhar ao tentar cadastrar um mercado com CNPJ inválido', async () => {
            await p
                .spec()
                .post(`${baseUrl}/mercado`)
                .expectStatus(StatusCodes.BAD_REQUEST)
                .withBody({
                    cnpj: '123', // CNPJ inválido
                    endereco: faker.location.streetAddress(),
                    nome: faker.company.name()
                });
        });

        it('Deve falhar ao tentar buscar um mercado inexistente pelo ID', async () => {
            const idInvalido = 99999; 
            await p
                .spec()
                .get(`${baseUrl}/mercado/${idInvalido}`)
                .expectStatus(StatusCodes.NOT_FOUND);
        });

        it('Deve remover um mercado pelo ID', async () => {
            const mercadoId = 3;//Precisa atualizar com algum ID que ainda esteja presente
            await p
                .spec()
                .delete(`${baseUrl}/mercado/${mercadoId}`)
                .expectStatus(StatusCodes.OK);
            console.log(`Mercado com ID ${mercadoId} removido.`);
        });

        it('Deve falhar ao tentar remover um mercado inexistente pelo ID', async () => {
            const idInvalido = 99999; 
            await p
                .spec()
                .delete(`${baseUrl}/mercado/${idInvalido}`)
                .expectStatus(StatusCodes.NOT_FOUND);
        });

        it('Deve validar a estrutura dos dados retornados ao buscar todos os mercados', async () => {
            await p
                .spec()
                .get(`${baseUrl}/mercado`)
                .expectStatus(StatusCodes.OK)
                .expectJsonLike([{
                    id: /.*/,
                    nome: /.*/,
                    endereco: /.*/,
                    cnpj: /.*/
                }]);
        });

        it('Deve falhar ao tentar atualizar um mercado inexistente', async () => {
            const idInvalido = 99999; 
            await p
                .spec()
                .put(`${baseUrl}/mercado/${idInvalido}`)
                .expectStatus(StatusCodes.NOT_FOUND)
                .withBody({
                    cnpj: (Math.random() * 100000000000000).toFixed(0),
                    endereco: faker.location.streetAddress(),
                    nome: faker.company.name()
                });
        });

        it('Deve trazer um mercado com todos os seus detalhes', async () => {
            await p
                .spec()
                .get(`${baseUrl}/mercado/${mercadoId}`)
                .expectStatus(StatusCodes.OK)
                .expectJsonLike({
                    id: mercadoId,
                    nome: /.*/,
                    endereco: /.*/,
                    cnpj: /.*/
                });
        });

        it('Deve falhar ao tentar cadastrar um mercado sem nome', async () => {
            await p
                .spec()
                .post(`${baseUrl}/mercado`)
                .expectStatus(StatusCodes.BAD_REQUEST)
                .withBody({
                    cnpj: (Math.random() * 100000000000000).toFixed(0),
                    endereco: faker.location.streetAddress(),
                    nome: '' 
                });
        });
    });
});
describe('Mercado Produtos Hortifruit', () => {
    const p = pactum;
    const rep = SimpleReporter;
    const baseUrl = 'https://api-desafio-qa.onrender.com';
    let mercadoId = null;
    let frutaId = null;

    p.request.setDefaultTimeout(30000);

    beforeAll(() => p.reporter.add(rep));
    afterAll(() => p.reporter.end());

    describe('Operações de Frutas', () => {
        // Assumindo que já temos um mercado criado para os testes
        beforeAll(async () => {
            const mercadoResponse = await p
                .spec()
                .post(`${baseUrl}/mercado`)
                .withBody({
                    cnpj: (Math.random() * 100000000000000).toFixed(0),
                    endereco: faker.location.street(),
                    nome: faker.person.fullName()
                })
                .expectStatus(StatusCodes.CREATED)
                .returns('novoMercado.id');
            mercadoId = mercadoResponse;
        });

        it('Deve cadastrar uma nova fruta', async () => {
            const fruta = {
                nome: faker.commerce.productName(),
                preco: faker.commerce.price(),
                quantidade: Math.floor(Math.random() * 100) + 1
            };
            const response = await p
                .spec()
                .post(`${baseUrl}/mercado/${mercadoId}/produtos/hortifruit/frutas`)
                .withBody(fruta)
                .expectStatus(StatusCodes.CREATED)
                .returns('fruta.id');
            frutaId = response; // Armazenar o ID da fruta criada
            console.log('Fruta criada com ID:', frutaId);
        });

        it('Deve trazer todas as frutas cadastradas para o mercado', async () => {
            await p
                .spec()
                .get(`${baseUrl}/mercado/${mercadoId}/produtos/hortifruit/frutas`)
                .expectStatus(StatusCodes.OK)
                .expectJsonLike([{
                    id: /.*/,
                    nome: /.*/,
                    preco: /.*/,
                    quantidade: /.*/
                }]);
        });

        it('Deve atualizar uma fruta pelo ID', async () => {
            const updatedFruta = {
                nome: 'Banana',
                preco: '1.50',
                quantidade: 30
            };
            await p
                .spec()
                .put(`${baseUrl}/mercado/${mercadoId}/produtos/hortifruit/frutas/${frutaId}`)
                .withBody(updatedFruta)
                .expectStatus(StatusCodes.OK);
        });

        it('Deve remover uma fruta pelo ID', async () => {
            await p
                .spec()
                .delete(`${baseUrl}/mercado/${mercadoId}/produtos/hortifruit/frutas/${frutaId}`)
                .expectStatus(StatusCodes.OK);
        });

        it('Deve falhar ao tentar buscar uma fruta removida', async () => {
            await p
                .spec()
                .get(`${baseUrl}/mercado/${mercadoId}/produtos/hortifruit/frutas/${frutaId}`)
                .expectStatus(StatusCodes.NOT_FOUND);
        });
    });
});