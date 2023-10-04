/// <reference types="cypress" />

import loc from '../../support/locators'
import '../../support/commandsContas'
import buildEnv from '../../support/buildEnv'

describe('Should test at functional level', () => {
    after(()=>{
        cy.clearLocalStorage()
    })

    beforeEach(()=>{
        buildEnv()
        cy.login('gabriel321123@gmail.com', 'senha errada')
        cy.get(loc.MENU.HOME).click()
        //cy.resetApp()
    })

    it('Should creat an account', ()=>{
        cy.route({
            method: 'POST',
            url: '/contas',
            response: {id: 3, nome: 'Conta de Teste', visivel: true, usuario_id: 1}
        }).as('saveConta')

        cy.acessarMenuConta()

        cy.route({
            method: 'GET',
            url: '/contas',
            response: [
                {id: 1, nome: 'Carteira', visivel: true, usuario_id: 1},
                {id: 2, nome: 'Banco', visivel: true, usuario_id: 1},
                {id: 3, nome: 'Conta de Teste', visivel: true, usuario_id: 1},
            ]
        }).as('contasSave')

        cy.inserirConta('Conta de teste')
        cy.get(loc.MESSAGE).should('contain', 'Conta inserida com sucesso!')
    })

    it('Should update an account',()=>{

        cy.route({
            method: 'PUT',
            url: '/contas/**',
            response: {id: 1, nome: 'Conta alterada', visivel: true, usuario_id: 1}
        })

        cy.acessarMenuConta()
        
        cy.xpath(loc.CONTAS.FN_XP_BTN_ALTERAR('Banco')).click()
        cy.get(loc.CONTAS.NOME)
            .clear()
            .type('Conta alterada')
        cy.get(loc.CONTAS.SALVAR).click()
        cy.get(loc.MESSAGE).should('contain', 'Conta atualizada com sucesso!')
    })

    it('Should not creat an account with same name', ()=>{
        
        cy.route({
            method: 'POST',
            url: '/contas',
            response: {"error": "Já existe uma conta com esse nome!"},
            status: 400
        }).as('saveContaMesmoNome')
        
        cy.acessarMenuConta()

        cy.get(loc.CONTAS.NOME).type('Conta mesmo nome')
        cy.get(loc.CONTAS.SALVAR).click()
        cy.get(loc.MESSAGE).should('contain', 'code 400')
    })

    it('Should creat a transaction', ()=>{
        
        cy.route({
            method: 'POST',
            url: '/transacoes',
            response: {
                "id": 1803820, "descricao": "asdsadas", "envolvido": "qweqweq", "observacao": null, "tipo": "REC", "data_transacao": "2023-10-03T03:00:00.000Z", "data_pagamento": "2023-10-03T03:00:00.000Z", "valor": "232.00", "status": false, "conta_id": 1924888, "usuario_id": 41427, "transferencia_id": null, "parcelamento_id": null
            }
        })

        cy.get(loc.MENU.MOVIMENTACAO).click()

        cy.get(loc.MOVIMENTACAO.DESCRICAO).type('Desc')
        cy.get(loc.MOVIMENTACAO.VALOR).type('123')
        cy.get(loc.MOVIMENTACAO.INTERESSADO).type('Interessado')
        cy.get(loc.MOVIMENTACAO.CONTA).select('Banco')
        cy.get(loc.MOVIMENTACAO.STATUS).click()
        cy.get(loc.MOVIMENTACAO.BTN_SALVAR).click()
        cy.get(loc.MESSAGE).should('contain', 'sucesso')

        cy.get(loc.EXTRATO.LINHAS).should('have.length', '7')
        cy.xpath(loc.EXTRATO.FN_XP_BUSCA_ELEMENTO('Desc', '123')).should('exist')
    })

    it('Should get balance', ()=>{

        cy.route({
            method: 'GET',
            url: '/transacoes/**',
            response: {"conta":"Conta para saldo","id":1803823,"descricao":"Movimentacao 1, calculo saldo","envolvido":"CCC","observacao":null,"tipo":"REC","data_transacao":"2023-10-03T03:00:00.000Z","data_pagamento":"2023-10-03T03:00:00.000Z","valor":"3500.00","status":false,"conta_id":1924898,"usuario_id":41427,"transferencia_id":null,"parcelamento_id":null}
        })

        cy.route({
            method: 'PUT',
            url: '/transacoes/**',
            response: {"conta":"Conta para saldo","id":1803823,"descricao":"Movimentacao 1, calculo saldo","envolvido":"CCC","observacao":null,"tipo":"REC","data_transacao":"2023-10-03T03:00:00.000Z","data_pagamento":"2023-10-03T03:00:00.000Z","valor":"3500.00","status":false,"conta_id":1924898,"usuario_id":41427,"transferencia_id":null,"parcelamento_id":null}
        })

        cy.get(loc.MENU.HOME).click()
        cy.xpath(loc.SALDO.FN_XP_SALDO_CONTA('Carteira')).should('contain', '100,00')
        
        cy.get(loc.MENU.EXTRATO).click()
        cy.xpath(loc.EXTRATO.FN_XP_ALTERAR_ELEMENTO('Movimentacao 1, calculo saldo')).click()
        
        cy.get(loc.MOVIMENTACAO.DESCRICAO).should('have.value', 'Movimentacao 1, calculo saldo')
        cy.get(loc.MOVIMENTACAO.STATUS).click()
        cy.get(loc.MOVIMENTACAO.BTN_SALVAR).click()
        cy.get(loc.MESSAGE).should('contain', 'sucesso')

        cy.route({
            method: 'GET',
            url: '/saldo',
            response: [{
                conta_id: 999,
                conta: 'Carteira',
                saldo: '4034.00'
            },
            {
                conta_id: 9909,
                conta: 'Banco',
                saldo: '10000000.00'
            }]
        }).as('saldoFinal')

        cy.get(loc.MENU.HOME).click()
        cy.get(loc.MENU.EXTRATO).click()
        cy.get(loc.MENU.HOME).click()
        cy.xpath(loc.SALDO.FN_XP_SALDO_CONTA('Carteira')).should('contain', '4.034,00')
    })

    it('Should remove a transaction', ()=>{
        
        cy.route({
            method: 'DELETE',
            url: '/transacoes/**',
            response: {},
            status: 204
        })

        cy.get(loc.MENU.EXTRATO).click()
        cy.xpath(loc.EXTRATO.FN_XP_REMOVER_ELEMENTO('Movimentacao para exclusao')).click()
        cy.get(loc.MESSAGE).should('contain', 'sucesso')
    })

    it('Should validate data send to create an account', ()=>{
        const reqStub = cy.stub()
        cy.route({
            method: 'POST',
            url: '/contas',
            response: {id: 3, nome: 'Conta de Teste', visivel: true, usuario_id: 1},
            // onRequest: req =>{
            //     expect(req.request.body.nome).to.be.empty
            //     expect(req.request.headers).to.have.property('Authorization')
            // }
            onRequest: reqStub
        }).as('saveConta')

        cy.acessarMenuConta()

        cy.route({
            method: 'GET',
            url: '/contas',
            response: [
                {id: 1, nome: 'Carteira', visivel: true, usuario_id: 1},
                {id: 2, nome: 'Banco', visivel: true, usuario_id: 1},
                {id: 3, nome: 'Conta de Teste', visivel: true, usuario_id: 1},
            ]
        }).as('contasSave')

        cy.inserirConta('{CONTROL}')
        //cy.wait('@saveConta').its('request.body.nome').should('not.be.empty')
        cy.wait('@saveConta').then(()=>{
            expect(reqStub.args[0][0].request.body.nome).to.be.empty
            expect(reqStub.args[0][0].request.headers).to.have.property('Authorization')
            
        })
        cy.get(loc.MESSAGE).should('contain', 'Conta inserida com sucesso!')
    })
    it('Should test colors', ()=>{
        
        cy.route({
            method: 'GET',
            url: '/extrato/**',
            response: [
                {"conta":"Conta para movimentacoes","id":1803821,"descricao":"Receita paga","envolvido":"AAA","observacao":null,"tipo":"REC","data_transacao":"2023-10-03T03:00:00.000Z","data_pagamento":"2023-10-03T03:00:00.000Z","valor":"-1500.00","status":true,"conta_id":1924896,"usuario_id":41427,"transferencia_id":null,"parcelamento_id":null},
                {"conta":"Conta com movimentacao","id":1803822,"descricao":"Receita pendente","envolvido":"BBB","observacao":null,"tipo":"REC","data_transacao":"2023-10-03T03:00:00.000Z","data_pagamento":"2023-10-03T03:00:00.000Z","valor":"-1500.00","status":false,"conta_id":1924897,"usuario_id":41427,"transferencia_id":null,"parcelamento_id":null},
                {"conta":"Conta para saldo","id":1803823,"descricao":"Despesa paga","envolvido":"CCC","observacao":null,"tipo":"DESP","data_transacao":"2023-10-03T03:00:00.000Z","data_pagamento":"2023-10-03T03:00:00.000Z","valor":"3500.00","status":true,"conta_id":1924898,"usuario_id":41427,"transferencia_id":null,"parcelamento_id":null},
                {"conta":"Conta para saldo","id":1803824,"descricao":"Despesa pendente","envolvido":"DDD","observacao":null,"tipo":"DESP","data_transacao":"2023-10-03T03:00:00.000Z","data_pagamento":"2023-10-03T03:00:00.000Z","valor":"-1000.00","status":false,"conta_id":1924898,"usuario_id":41427,"transferencia_id":null,"parcelamento_id":null},
            ]
        })
        
        cy.get(loc.MENU.EXTRATO).click()
        cy.xpath(loc.EXTRATO.FN_XP_LINHA('Receita paga')).should('have.class', 'receitaPaga')
        cy.xpath(loc.EXTRATO.FN_XP_LINHA('Receita pendente')).should('have.class', 'receitaPendente')
        cy.xpath(loc.EXTRATO.FN_XP_LINHA('Despesa paga')).should('have.class', 'despesaPaga')
        cy.xpath(loc.EXTRATO.FN_XP_LINHA('Despesa pendente')).should('have.class', 'despesaPendente')
    })

    it('Should test the responsiveness',()=>{
        cy.get('[data-test=menu-home]').should('exist')
            .and('be.visible')
        cy.viewport(500,700)
        cy.get('[data-test=menu-home]').should('exist')
            .and('be.not.visible')

        cy.viewport('iphone-5')
        cy.get('[data-test=menu-home]').should('exist')
            .and('be.not.visible')

        cy.viewport('ipad-2')
        cy.get('[data-test=menu-home]').should('exist')
            .and('be.visible')
    })
})