import * as PIXI from 'pixi.js';
import * as R from 'ramda';

// CREATE STAGE

const { clientWidth, clientHeight } = document.documentElement;
const proportionedHeight = clientWidth / 1.8
const isClientHeightUse = proportionedHeight > clientHeight

const app = new PIXI.Application({
    width: isClientHeightUse ? clientHeight * 1.8 : clientWidth,
    height: isClientHeightUse ? clientHeight : proportionedHeight,
    transparent: true,
    resolution: 1,
});
 
document.body.appendChild(app.view);
const APP_WIDTH = app.screen.width;
const APP_HEIGHT = app.screen.height;
const STAGE = app.stage;

//LOADING GAME

loadData();

const wait = (ms: number): Promise<void> => new Promise((res) => setTimeout(res, ms))

async function loadData() {
    try {
        const resp = await fetch('./db.json');
        await wait(3000);
        const data = await resp.json();
        if (data) {
            loadText.destroy();
            createGame(data.images, data.wild);
        }
    } catch(err) {
        return err;
    }
}

const recLoad = new PIXI.Graphics();
recLoad.beginFill(0, 1);
recLoad.drawRect(0, 0, APP_WIDTH, APP_HEIGHT);
STAGE.addChild(recLoad);
const LoadStyles = new PIXI.TextStyle({
    fontFamily: 'Lato',
    fontSize: APP_WIDTH / 8,
    fill: ['white'],
});

const loadText = new PIXI.Text('LOADING...', LoadStyles)
loadText.x = (APP_WIDTH - loadText.width) / 2;
loadText.y = (APP_WIDTH - loadText.width) / 2;
recLoad.addChild(loadText);


// CREATE GAME
function createGame(images, wild) {
    let coins = 100;
    const WILDS_SYMBOL = wild;

    // BACKGROUND

    const background = PIXI.Sprite.from('assets/BG.png');
    background.width = APP_WIDTH;
    background.height = APP_HEIGHT;
    STAGE.addChild(background);
    
    // REELS
    images.forEach(image => {
        app.loader.add(image, image);
    });
    app.loader.load(onAssetsLoaded);
    
    const REEL_WIDTH = APP_WIDTH / 8;
    const SYMBOL_SIZE = Math.floor(APP_HEIGHT / 3) + 10;
        
    
    // onAssetsLoaded handler builds the example.
    function onAssetsLoaded() {
        // Create different slot symbols.

        const slotTextures = [];
        images.forEach(image => slotTextures.push(PIXI.Texture.from(image)));
    
        // Build the reels
        let reels = [];
        const reelContainer = new PIXI.Container();
        for (let i = 0; i < 3; i++) {
            const rc = new PIXI.Container();
            rc.x = i * REEL_WIDTH * 2;
            reelContainer.addChild(rc);
    
            const reel = {
                container: rc,
                symbols: [],
                position: 0,
                previousPosition: 0,
                blur: new PIXI.filters.BlurFilter(),
            };
            reel.blur.blurX = 0;
            reel.blur.blurY = 0;
            rc.filters = [reel.blur];
    
            // Build the symbols
            for (let j = 0; j < slotTextures.length; j++) {
                const symbol = new PIXI.Sprite(slotTextures[Math.floor(Math.random() * slotTextures.length)]);
                // Scale the symbol to fit symbol area.
                symbol.y = j * (SYMBOL_SIZE / 3);            
                symbol.scale.x = symbol.scale.y = Math.min(SYMBOL_SIZE / symbol.width, SYMBOL_SIZE / symbol.height);
                symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);
                reel.symbols.push(symbol);
                rc.addChild(symbol);
            }
            reels.push(reel);                
        }
        STAGE.addChild(reelContainer);
        const margin = APP_HEIGHT / 25;
        reelContainer.y = margin;
        reelContainer.x = Math.round(APP_WIDTH / 11);
    
    // SCORE BLOCK
    
    const recScore = new PIXI.Graphics();
    recScore.beginFill(0, 0.5);
    const xRecPos = APP_WIDTH - APP_WIDTH / 7;
    const yRecPos = APP_HEIGHT - APP_HEIGHT / 3;
    recScore.drawRoundedRect (xRecPos, yRecPos, APP_WIDTH / 9.5, APP_HEIGHT / 10, 3);
    const style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: recScore.width / 8,
        fill: ['yellow'],
    });
    
     const moneyText = new PIXI.Text(`MONEY: ${coins}`, style);
     moneyText.x = xRecPos + ((recScore.width - moneyText.width) / 2)
     moneyText.y = yRecPos + 6;
     const winText = new PIXI.Text('WIN: 0', style);
     winText.x = moneyText.x;
     winText.y = yRecPos + recScore.height - (winText.height + 6); 
     recScore.addChild(moneyText);
     recScore.addChild(winText);
    
     STAGE.addChild(recScore);
    
     function renderMoneyText() {
        moneyText.text = `MONEY: ${coins}`;
     }
    
     function renderWinText(num) {
        winText.text = `WIN: ${num}`;
     }
    
    
     // WINS SCREEN
    
     const recWin = new PIXI.Graphics();
     recWin.beginFill(0x036b61, 0.5);
    
    const xPosRecWin = APP_WIDTH / 14;
    const yPosRecWin = margin;
    recWin.drawRoundedRect (xPosRecWin, yPosRecWin, APP_WIDTH / 1.33, APP_HEIGHT - (margin - 3) * 2, 3);
    const style1 = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: recScore.width,
        fill: ['yellow'],
        fontWeight: 'bold',
    });
    
    const winnerText = new PIXI.Text('YOU WON!', style1);
    winnerText.x = xPosRecWin + ((recWin.width - winnerText.width) / 2)
    winnerText.y = yPosRecWin + ((recWin.height - winnerText.height) / 2);
    recWin.addChild(winnerText);
    STAGE.addChild(recWin);
    
     function showWinRec() {
        recWin.visible = true;
     }
    
     function hideWinRec() {
         recWin.visible = false;
     }
     hideWinRec();
    
    // BUTTONS PLAY
    
    const BUTTON_SIZE =  Math.floor(APP_WIDTH / 9.7);
    const BUTTOM_MARGIN = APP_WIDTH - APP_WIDTH / 7;
    const playButtonDisabled = PIXI.Sprite.from('assets/BTN_Spin_d.png');
    playButtonDisabled.x = BUTTOM_MARGIN;
    playButtonDisabled.y = APP_HEIGHT / 2 - BUTTON_SIZE / 2;
    playButtonDisabled.width = BUTTON_SIZE;
    playButtonDisabled.height = BUTTON_SIZE;
    STAGE.addChild(playButtonDisabled);
    
    const playButtonActive = PIXI.Sprite.from('assets/BTN_Spin.png');
    playButtonActive.x = BUTTOM_MARGIN;
    playButtonActive.y = APP_HEIGHT / 2 - BUTTON_SIZE / 2;
    playButtonActive.width = BUTTON_SIZE;
    playButtonActive.height = BUTTON_SIZE;
    
    playButtonActive.interactive = true;
    playButtonActive.buttonMode = true;
    
    playButtonActive.on('pointerdown', startPlay);
    STAGE.addChild(playButtonActive);
    
    
        function startPlay() {
            hideWinRec();
            playButtonActive.visible = false;
            coins -= 5;
            renderMoneyText();
            renderWinText(0);
    
            for (let i = 0; i < reels.length; i++) {
                const r = reels[i];
                const target = r.position + 10 + i * 5 + 2;
                const time = 1500 + i * 200 + 3 * 100;
                tweenTo(r, 'position', target, time, backout(0.5), null, i === reels.length - 1 ? reelsComplete : null);
            }
        }
    
        // Reels done handler.
        function reelsComplete() {
            const eqY = el => {
                return el.y === el.width
            }
            const getIds = R.pathOr([], ['texture', 'textureCacheIds'])
            const getSymbol = R.pipe(
                R.prop(R.__, reels),
                R.prop('symbols'),
                R.find(eqY),
                getIds
            )
            const firstSymbol = getSymbol(0);
            const secondSymbol = getSymbol(1);
            const thirdSymbol = getSymbol(2);
            const finalMapResault = [...firstSymbol, ...secondSymbol, ...thirdSymbol]
                .reduce((acc, el) => {
                    acc[el] = (acc[el] || 0) + 1;
                    return acc;
                }, {});
            let isWinn = false;
            if (Object.keys(finalMapResault).length === 3) {
                isWinn = false;
            } else {
                if (finalMapResault[WILDS_SYMBOL] === 3) {
                    isWinn = false;
                } else if (finalMapResault[WILDS_SYMBOL] === 2) {
                    isWinn = true;
                } else if (finalMapResault[WILDS_SYMBOL]) {
                    if (R.contains(2, Object.values(finalMapResault))) {
                        isWinn = true;
                    } else isWinn = false;
                } else {
                    if(R.contains(3, Object.values(finalMapResault))) {
                       isWinn = true;
                    } else isWinn = false;
                }
            }
            if (isWinn) {
                showWinRec()
                setTimeout(() => hideWinRec(), 2000);
                coins+=10;
                renderMoneyText();
                renderWinText(10);
            };
            
            if(coins !== 0){
                playButtonActive.visible = true;
            }
        }
    
        // Listen for animate update.
        app.ticker.add((delta) => {
        // Update the slots.
            for (let i = 0; i < reels.length; i++) {
                const r = reels[i];
                // Update blur filter y amount based on speed.
                r.blur.blurY = (r.position - r.previousPosition) * 8;
                r.previousPosition = r.position;
    
                // Update symbol positions on reel.
                for (let j = 0; j < r.symbols.length; j++) {
                    const s = r.symbols[j];
                    const prevy = s.y;     
                    
                    s.y = ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;
                    
                    
                    if (s.y < 0 && prevy > SYMBOL_SIZE) {
                        // Detect going over and swap a texture.
                        s.texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
                        s.scale.x = s.scale.y = Math.min(SYMBOL_SIZE / s.texture.width, SYMBOL_SIZE / s.texture.height);
                        s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
                    }
                }
            }
        });
    }
    
    // Very simple tweening utility function. This should be replaced with a proper tweening library in a real product.
    const tweening = [];
    function tweenTo(object, property, target, time, easing, onchange, oncomplete) {
        const tween = {
            object,
            property,
            propertyBeginValue: object[property],
            target,
            easing,
            time,
            change: onchange,
            complete: oncomplete,
            start: Date.now(),
        };
    
        tweening.push(tween);
        return tween;
    }
    // Listen for animate update.
    app.ticker.add((delta) => {
        const now = Date.now();
        const remove = [];
        for (let i = 0; i < tweening.length; i++) {
            const t = tweening[i];
            const phase = Math.min(1, (now - t.start) / t.time);
            const lrp = lerp(t.propertyBeginValue, t.target, t.easing(phase));
            t.object[t.property] = lrp > t.target ? t.target : lrp
            if (t.change) t.change(t);
            if (phase === 1) {
                t.object[t.property] = t.target;
                if (t.complete) t.complete(t);
                remove.push(t);
            }
        }
        for (let i = 0; i < remove.length; i++) {
            tweening.splice(tweening.indexOf(remove[i]), 1);
        }
    });
    
    // Basic lerp funtion.
    function lerp(a1, a2, t) {
        return a1 * (1 - t) + a2 * t;
    }
    
    // Backout function from tweenjs.
    // https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
    function backout(amount) {
        return t => (--t * t * ((amount + 1) * t + amount) + 1);
    }
}

