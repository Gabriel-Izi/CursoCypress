/// <reference types="cypress" />

//.skip = pula o teste ou o grupo de testes
//.only = executa apenas aquele teste ou groupe; pega o último only

it('A external test...', () =>{

})

describe('Should group tests...', () => {
    describe("Should group more specific tests...", () => {
        it('A specific test...', () =>{

        })
    })
    
    describe("Should group more specific tests 2...", () => {
        it('A specific test 2...', () =>{

        })
    })

    it('A internal test ...', () => {

    })
})