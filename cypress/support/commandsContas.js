import loc from './locators'

Cypress.Commands.add('acessarMenuConta', ()=>{
    cy.get(loc.MENU.SETTINGS).click()
    cy.get(loc.MENU.CONTAS).click()
})

Cypress.Commands.add('inserirConta', conta =>{
    cy.get(loc.CONTAS.NOME).type(conta)
    cy.get(loc.CONTAS.SALVAR).click()
})
        
        
        