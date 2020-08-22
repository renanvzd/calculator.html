class CalcController {
    
    constructor() {     //* Dentro do constructor vão os atributos

        this._audio = new Audio('click.mp3');
        this._audioOnOff = false;
        this._lastOperator = '';
        this._lastNumber = '';

        this._operation = [];
        this._locale = 'pt-BR';
        this._displayCalcEl = document.querySelector("#display");
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");
        this._currentDate; 
        this.initialize();
        this.initButtonsEvents();
        this.initKeyboard();

    }

    initialize(){
        
        this.setDisplayDateTime();          //Método antes do setInterval exibe o relógio na hora
        
        setInterval(()=>{

            this.setDisplayDateTime();

        }, 1000);

        this.setLastNumberToDisplay();

        this.pasteFromClipboard();

        document.querySelectorAll('.btn-ac').forEach(btn=>{

            btn.addEventListener('dblclick', e=>{

                this.toggleAudio()

            });

        })
    }

    toggleAudio(){

        this._audioOnOff = !this._audioOnOff;       //If resumido: inverte ao contrário do que está

        /* 
        If ternário:
        this._audioOnOff = (this._audioOnOff) ? false : true;       
        
        If normal:
        if (this._audioOnOff) {
            this._audioOnOff = false;
        } else {
            this._audioOnOff = true;
        }
        */
    }

    playAudio() {

        if (this._audioOnOff) {

            this._audio.currentTime = 0;
            this._audio.play();

        }

    }


    initKeyboard() {

        document.addEventListener('keyup', e=>{

            this.playAudio();

            switch (e.key) {

                case 'Escape':
                    this.clearAll();
                    break;
                case 'Backspace':
                    this.clearEntry();
                    break;

                case '+':
                case '-':
                case '/':
                case '*':
                case '%':
                    this.addOperation(e.key);
                    break;

                case 'Enter':
                case '=':
                    this.calc();
                    break;

                case 'Ponto':
                case '.':
                case ',':
                    this.addDot();
                    break;
                
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;

                case 'c':
                    if (e.ctrlKey) this.copyToClipboard();
                    break;
            }

        });

    }

    copyToClipboard() {

        let input = document.createElement('input');    //Para criar elementos na tela dinamicamente

        input.value = this.displayCalc;

        document.body.appendChild(input);

        input.select();

        document.execCommand("Copy");

        input.remove();

    }

    pasteFromClipboard() {

        document.addEventListener('paste', e=>{

            let text = e.clipboardData.getData('Text');         //Text é o tipo de parâmetro. 

            this.displayCalc = parseFloat(text);

        })

    }

    addEventListenerAll(element, events, fn) {

        events.split(' ').forEach(event => {

            element.addEventListener(event, fn, false);

        });

    }
 
    clearAll() {
        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';
        this.setLastNumberToDisplay();
    }

    clearEntry() {
        this._operation.pop();
        this.setLastNumberToDisplay();
    }

    getLastOperation() {
        return this._operation[this._operation.length-1];          //pegar o último elemento do array
    }

    setLastOperation(value){

        this._operation[this._operation.length-1] = value;

    }

    isOperator(value) {

       return (['+', '-', '*', '%', '/'].indexOf(value) > -1);

    }

    pushOperation(value) {

        this._operation.push(value);

        if (this._operation.length > 3) {

            this.calc();
        
        }

    }

    getResult() {

        try{
            return eval(this._operation.join(""));    
        }catch(e){
            setTimeout(()=>{
                this.setError();
            }, 1);      //1 milisegundo
        }

    }
        


    calc() {

        let last = '';

        this._lastOperator = this.getLastItem();                //A. 19

        if (this._operation.length < 3) {

            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];


        }

        if (this._operation.length > 3) {
            
            last = this._operation.pop();
            this._lastNumber = this.getResult();

        } else if (this._operation.length == 3) {

            this._lastNumber = this.getLastItem(false);         //A. 19

        }

        //console.log('_lastOperator', this._lastOperator);
        //console.log('_lastNumber', this._lastNumber);

        let result = this.getResult();

        if (last == '%') {

            result /= 100;
            this._operation = [result];  

        } else {

            this._operation = [result];
            
            if (last) this._operation.push(last);

        }

        this.setLastNumberToDisplay();

    }

    getLastItem(isOperator = true) {

        let lastItem;
        
        for (let i = this._operation.length-1; i >=0; i--) {
            
            if (this.isOperator(this._operation[i]) == isOperator) {
                lastItem = this._operation[i];
                break;
            }

        }

        if(!lastItem) {

            lastItem = (isOperator) ? this._lastOperator : this._lastNumber

        }

        return lastItem;

    }

    setLastNumberToDisplay() {

        let lastNumber = this.getLastItem(false);
        
        if (!lastNumber) lastNumber = 0;

        this.displayCalc = lastNumber;
    }

    addOperation(value) {

        if (isNaN(this.getLastOperation())) {
                                                                                        //string {
            if(this.isOperator(value)) {            //Se o valor for operador, então troca o operador

                this.setLastOperation(value);

            } else {

                this.pushOperation(value);

                this.setLastNumberToDisplay();
                
            }
            
        } else {

            if (this.isOperator(value)) {

                this.pushOperation(value);

            } else {

                let newValue = this.getLastOperation().toString() + value.toString();         //if number 
                this.setLastOperation(newValue);

                //atualizar display
                this.setLastNumberToDisplay();

            }

        }

    }

    setError(){
        this.displayCalc = "Error";
    }

    addDot() {

        let lastOperation = this.getLastOperation();

        if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

        if (this.isOperator(lastOperation) || !lastOperation) {
            this.pushOperation('0.');
        } else {
            this.setLastOperation(lastOperation.toString() + '.');
        }
        
        this.setLastNumberToDisplay();

    }

    execBtn(value){

        this.playAudio();

        switch (value) {

            case 'ac':
                this.clearAll();
                break;
            case 'ce':
                this.clearEntry();
                break;
            case 'soma':
                this.addOperation('+');
                break;
            case 'subtracao':
                this.addOperation('-');
                break;
            case 'divisao':
                this.addOperation('/');
                break;
            case 'multiplicacao':
                this.addOperation('*');
                break;
            case 'porcento':
                this.addOperation('%');
                break;
            case 'igual':
                this.calc();
                break;
            case 'ponto':
                this.addDot();
                break;
            
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;
            default:
                this.setError();
                break;
        }

    }


    initButtonsEvents(){

        let buttons = document.querySelectorAll("#buttons > g, #parts > g");

        buttons.forEach((btn, index)=>{

            this.addEventListenerAll(btn, "click drag", e => {

                let textBtn = btn.className.baseVal.replace("btn-", "");

                this.execBtn(textBtn);

            });

            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {

                btn.style.cursor = "pointer";

            })

        })
        
    }

    setDisplayDateTime(){
        
        this.displayDate = this.currentDate.toLocaleDateString(this._locale,{
            day: "2-digit",
            month: "long",
            year:"numeric"
        });
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);

    }

    get displayTime(){
        return this._timeEl.innerHTML;
    }

    set displayTime(value){
        return this._timeEl.innerHTML = value;
    }

    get displayDate(){
        return this._dateEl.innerHTML;
    }

    set displayDate(value){
        return this._dateEl.innerHTML = value;
    }

    get displayCalc(){

        return this._displayCalcEl.innerHTML;

    }

    set displayCalc(value){

        if (value.toString().length > 10) {
            this.setError();
            return false;
        }

        this._displayCalcEl.innerHTML = value;

    }

    get currentDate(){ 

        return new Date();

    }

    set currentDate(valor){
        
        this._currentDate = valor;

    }

}