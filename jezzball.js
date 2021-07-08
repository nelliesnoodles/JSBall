// JavaScript source code
// Jezzball game engine
// author: Nellie Tobey

let GAMESCREEN;

let MAXX = 29;
let MAXY = 19;
let POINTS = 0;
let CHANCES = 3;

let oldMAXX = 29;
let oldMAXY = 19;


let MINX = 0;
let MINY = 0;

let oldMINX = 0;
let oldMINY = 0;

let MATRIX;
let CURRENT;
let WALL_COLLIDE = false;
// LOCK the direction change when a wall is being drawn
let LOCKED = false;
//LIVES and SCORE updated in ANIMATION interval
let LIVES;
let SCORE;
let SUCCESS = false;
let FAIL = false;


// ball images are cycled in bounce, using rotation as index in BALLS array
const BALLS = ['url(ball1.png)', 'url(ball2.png)', 'url(ball3.png)']
let rotation = 0;
let directionX = 1;
let directionY = 1;
// possible wall directions:  'NS' & 'EW'
let wallDirection = 'EW'

// must increase bounce time, as I had to increase the wait time in the asyn for the wall. 
let BOUNCEtime = 300;
let ANIMATION;
// reference for timer/async wall draw code: 
// https://stackoverflow.com/questions/3583724/how-do-i-add-a-delay-in-a-javascript-loop
const timer = ms => new Promise(res => setTimeout(res, ms));



function DOM_MATRIX() {
    let width = MAXX + 1 
    let height = MAXY + 1 
    let gamescreen = document.getElementById("gamescreen")
    // if div is in top row, add a border top 
    // if div is in the 0 position of row, add border left 
    // if div is in the max-end of row, add border right
    // if div is in last row, add border bottom
    //  x axis is column, y axis is row
    for (let row = 0; row < height; row++) {
        const newROW = document.createElement('div')
        newROW.classList.add("row")

        for (let column = 0; column < width; column++) {
            const htmlID = column + ":" + row;
            var newDiv = document.createElement('div');
            newDiv.addEventListener('click', divide);
            newDiv.id = htmlID;
            newDiv.setAttribute('value', true)
            newDiv.classList.add("cell")
            newROW.appendChild(newDiv)
            //newDiv.innerHTML = htmlID
           
        };
        gamescreen.appendChild(newROW)
    };
    // end construction
}

function set_DOM() {
    GAMESCREEN = document.getElementById("gamescreen");
    // contextmenu is the right click on the mouse
    GAMESCREEN.addEventListener('contextmenu', checkWallDirection, false);
    LIVES = document.getElementById("LIVES")
    SCORE = document.getElementById("SCORE")
}


function get_ball_position() {
    let position = CURRENT.getAttribute('id')
    let xypos = position.split(':')
    let x = parseInt(xypos[0])
    let y = parseInt(xypos[1])
    return [x, y]
}
function moveBALL() {
    let current_pos = get_ball_position()
    let x = current_pos[0]
    let y = current_pos[1]

    // direction changes are verried just slightly based on the location it his a wall
    // we want to make sure it doesn't get stuck in a corner, but also try to simulate some variety

    if (x >= MAXX || x <= MINX || y >= MAXY || y <= MINY) {
        
        if (x >= MAXX) {
            // this ball is in the right half
            if (y <= 3) {
                //the ball is in the bottom half
                //bounce it up and to the left
                directionX = -1
                directionY = 1
            }

            else if (y >= 15) {
                directionX = -1
                directionY = -2
            }

            else {
                directionX = -1
                
            }
        }
        else if (x <= MINX) {
            //this ball is in the left half
            if (y <= 3) {
                // ball is in the bottom half
                directionX = 1
                directionY = 1
            }

            else if (y >= 15) {
                directionX = 2
                directionY = -1
            }
            else {
                directionX = 2
                
            }
        }
        else if (y <= MINY) {
            if (x <= 3) {
                directionX = 1
                directionY = 2

            }
            else if (x >= 20) {
                directionX = -2
                directionY = 1

            }
            else {
               directionY = 1

            }
        }
        else if (y >= MAXY) {
            if (x <= 3) {
                directionX = 1
                directionY = -1
            }
            else if (x >= 20) {
                directionX = -2
                directionY = -1
            }
            else {
                
                directionY = -1
            }
        }
        
    }
    let newx = x + directionX
    let newy = y + directionY
    if (newx >= MAXX) {
        newx = MAXX
    }
    if (newx <= MINX) {
        newx = MINX
    }
    if (newy <= MINY) {
        newy = MINY
    }
    if (newy >= MAXY) {
        newy = MAXY
    }
    let newID = newx + ":" + newy
    let newELEM = document.getElementById(newID)
    bounce(CURRENT, newELEM);
    set_lives_score();
    
}

function set_lives_score() {
    if (SUCCESS) {
        SCORE.innerHTML = POINTS
    }
    if (FAIL) {
        CHANCES -= 1
        LIVES.innerHTML = CHANCES
        if (CHANCES == 0) {
            let end = document.getElementById("GAMEOVER")
            end.style.display = 'flex';
            window.clearInterval(ANIMATION)
            // ANIMATION will always be '1' unless it is set to a different value after first interval instantiation. 
            ANIMATION = null
            
        }
    }
    
    SUCCESS = false;
    FAIL = false;
   

}
function clear_wall(wallarray) {
    for (let i = 0; i < wallarray.length; i++) {
        let coords = wallarray[i]
        let x = coords[0]
        let y = coords[1]
        let cellid = x + ":" + y
        let cell = document.getElementById(cellid)
        cell.style.background = 'black'
    }
}
function pause() {
    
    if (ANIMATION != undefined || ANIMATION != null) {
        window.clearInterval(ANIMATION)
        // ANIMATION will always be '1' unless it is set to a different value after first interval instantiation. 
        ANIMATION = null
    }
    else {
        ANIMATION = window.setInterval(moveBALL, BOUNCEtime)

    }
}

function bounce(elem, newelem) {
    let image = BALLS[rotation]
    elem.style.backgroundImage = '';
    elem.classList.remove("ball")
    newelem.style.backgroundImage = image;
    newelem.style.backgroundSize = 'contain';
    newelem.classList.add("ball")
    
    rotation += 1;
    if (rotation > 2) {
        rotation = 0;
    }
    CURRENT = newelem
    
}



function checkWallDirection(event) {
    if (!LOCKED) {
        if (wallDirection == 'EW') {
            GAMESCREEN.classList.add('north-south')
            GAMESCREEN.classList.remove('east-west')
            wallDirection = 'NS'
        }
        else {
            GAMESCREEN.classList.add('east-west')
            GAMESCREEN.classList.remove('north-south')
            wallDirection = 'EW'
        }

        
    }
    event.preventDefault()
}

function check_collide(wall_array) {
    let ball_id = CURRENT.id 
    let xy = ball_id.split(":")
    let x = parseInt(xy[0])
    let y = parseInt(xy[1])
    for (let i = 0; i < wall_array.length; i++) {
        let item = wall_array[i]
        
        
        x1 = item[0]
        y1 = item[1]
        
        if (x == x1 && y == y1) {
            
            WALL_COLLIDE = true
            return true
        }
    }
    return false

}


 awaittime = 100
//  **  ASYNC  wall drawing mechanism  **
async function draw_wall_left(cell_to_change, wall_array) {
   
    await timer(awaittime)
    let collide = check_collide(wall_array)
    if (!collide) {
        cell_to_change.style.background = 'blue'
    }
    

    
}

async function draw_wall_right(cell_to_change, wall_array) {
    
    await timer(awaittime)
    let collide = check_collide(wall_array)
    if (!collide) {
        cell_to_change.style.background = 'red'    }


}


async function draw_wall_up(cell_to_change, wall_array) {
   
    await timer(awaittime)
    let collide = check_collide(wall_array)
    if (!collide) {
        cell_to_change.style.background = 'blue'
    }

}

async function draw_wall_down(cell_to_change, wall_array) {
    
    await timer(awaittime)
    let collide = check_collide(wall_array)
    if (!collide) {
        cell_to_change.style.background = 'red';
    }


}

/* EXAMPLE
 * fill left
 * [x0][x1][x2][<-y0] | [][]
 * [x0][x1][x2][<-y1] | [][]
 * [x0][x1][x2][<-y2] | [][]
 * [x0][x1][x2][<-y3] | [][]
 */
function fill_left(x) {
   
   
    // all x below x
    // all y with those x's from minx => maxx
    

    for (let a = MINY; a <= MAXY; a++) {
       
        for (let b = oldMINX; b <= x; b++) {
           
            let cellid = b + ':' + a           
            element1 = document.getElementById(cellid)          
            element1.style.border = '1px solid transparent';
            element1.style.background = 'black'
            element1.setAttribute('value', false)
            POINTS += 1
        };
        
    };
}


function fill_right(x) {
    
   
    // all x above x
    // all y with those x's from x => oldmaxx
    

    for (let a = MINY; a <= MAXY; a++) {

        for (let b = x; b <= oldMAXX; b++) {
            
            let cellid = b + ':' + a
            element1 = document.getElementById(cellid)
            element1.style.border = '1px solid transparent';
            element1.style.background = 'black'
            element1.setAttribute('value', false)
            POINTS += 1
        };

    };
}

function fill_up(y) {

    
    // all y to oldMINY
    // all x with y from MINX to MAXX
   
    for (let x = MINX; x <= MAXX; x++) {
        

        for (let b = y; b >= oldMINY; b--) {
            
            let cellid = x + ':' + b
            element1 = document.getElementById(cellid)
            element1.style.border = '1px solid transparent';
            element1.style.background = 'black'
            element1.setAttribute('value', false)
            POINTS += 1
        };

    };
}


function fill_down(y) {

    
    // all y to oldMAXY
    // all x with y from MINX to MAXX
    

    for (let x = MINX; x <= MAXX; x++) {
        

        for (let b = y; b <= oldMAXY; b++) {
            
            let cellid = x + ':' + b
            element1 = document.getElementById(cellid)
            element1.style.border = '1px solid transparent';
            element1.style.background = 'black'
            element1.setAttribute('value', false)
            POINTS += 1
        };

    };
}

function change_boundaries(xpos, ypos) {
    //console.log('change_boundaries')
    // xpos != x and ypos != y <= this shouldn't happen
    // it is possible if this function does not fire and redraw boundaries and gamescreen in alloted time and the ball bounces into the wall. 
    let ball_id = CURRENT.id
    let xy = ball_id.split(":")
    let ballx = parseInt(xy[0])
    let bally = parseInt(xy[1])
    let fill = 'up'
    
    
    if (wallDirection == 'EW') {
        // check if ball is on top or bottom of wall_array coordinates
        // y is constant
        
        if (bally > ypos) {
            // ball is under the wall
            oldMINY = MINY
            MINY = ypos + 1
            fill_up(ypos)

        }
        else {
            // ball is over the wall
            oldMAXY = MAXY
            MAXY = ypos - 1
            fill_down(ypos)
        }
      

    }
    else {
        // it is North South, check if ball is on left or right side of wall_array coordinates
        // x is constant

        if (ballx > xpos) {
            // ball is on the right of the wall
            oldMINX = MINX
            MINX = xpos + 1            
            fill_left(xpos)
        }
        else {
            // ball is on the left of the wall
            oldMAXX = MAXX
            MAXX = xpos - 1
            fill_right(xpos)
        }
    }
    

   

}


async function divide() {
    LOCKED = true
    
    let position = this.getAttribute('id')
    // valid attribute used so that the wall cannot be started on already cleared cells
    let valid = this.getAttribute('value')
    
    if (valid == 'true') {
        let COLLISION_ARRAY = []


        if (position != null && position != undefined) {
            let posxy = position.split(":")
            let linex = parseInt(posxy[0])
            let liney = parseInt(posxy[1])
            let start = [linex, liney]
            COLLISION_ARRAY.push(start)

            if (wallDirection == 'EW') {
                // left - right wall
                let i = linex + 1
                let j = linex
                let iterationcount = 0
                while (i <= MAXX || j >= MINX && WALL_COLLIDE != true) {
                    if (iterationcount > 30) {
                        //safety measure
                        break 
                    }
                    if (WALL_COLLIDE == true) {
                        break
                    }
                    if (i <= MAXX) {
                        let cellid = i + ":" + liney
                        let changecell = document.getElementById(cellid)
                        let wall_pos = [i, liney]
                        COLLISION_ARRAY.push(wall_pos)
                        await draw_wall_down(changecell, COLLISION_ARRAY)
                    }
                    if (j >= MINX) {
                        let cellid = j + ":" + liney
                        let changecell = document.getElementById(cellid)
                        let wall_pos = [j, liney]
                        COLLISION_ARRAY.push(wall_pos)
                        await draw_wall_up(changecell, COLLISION_ARRAY)
                    }
                    i++;
                    j--;
                    iterationcount++;


                }



            }
            else {
                // up - down wall
               
                let i = liney + 1
                let j = liney
                let iterationcount = 0
                while (i <= MAXY || j >= MINY && WALL_COLLIDE != true) {
                    if (iterationcount > 30) {
                        // safety measure
                        break
                    }
                    if (WALL_COLLIDE == true) {

                        break
                    }
                    if (i <= MAXY) {
                        let cellid = linex + ":" + i
                        let wall_pos = [linex, i]
                        let changecell = document.getElementById(cellid)
                        COLLISION_ARRAY.push(wall_pos)
                        await draw_wall_right(changecell, COLLISION_ARRAY)
                    }
                    if (j >= MINY) {
                        let cellid2 = linex + ":" + j
                        let changecell2 = document.getElementById(cellid2)
                        let wall_pos = [linex, j]
                        COLLISION_ARRAY.push(wall_pos)
                        await draw_wall_left(changecell2, COLLISION_ARRAY)
                    }
                    i++;
                    j--;
                    iterationcount++;
                }


            }
            /*       oppsy: Collision is not being registered
             *       fix:   the return false had to be outside the for loop checking current array of wall positions
             *              loop was breaking on return false inside loop, so all positions in array were not being checked.
                    for (let a = 0; a < COLLISION_ARRAY.length; a++) {
                        let poss = COLLISION_ARRAY[a]
                        console.log(poss)
                    }
            */

            if (!WALL_COLLIDE) {

                // the x_pos in east-west wall is the same throughout the COLLISION_ARRAY
                // for north-south the y_pos is the same throughout the COLLISION_ARRAY
                let firstcoords = COLLISION_ARRAY[0]
                let x_pos = firstcoords[0]
                let y_pos = firstcoords[1]
                // change_boundaries returns the fill direction for changing the effected div(#cells)
                change_boundaries(x_pos, y_pos)
                // change all squares in empty area, remove border, wall items should also be changed to background: black;
                SUCCESS = true;
            }
            else {
                clear_wall(COLLISION_ARRAY)
                FAIL = true;
            }
            WALL_COLLIDE = false;
            LOCKED = false;
        }
    }
}
function RunBounce() {
    //  runs the movement of the ball with the global time interval
    ANIMATION = window.setInterval(moveBALL, BOUNCEtime)
    // the east-west, north-south is the cursor image arrows
    if (wallDirection == 'EW') {
        GAMESCREEN.classList.add('east-west')
        GAMESCREEN.classList.remove('north-south')
    }
    else {
        GAMESCREEN.classList.add('north-south')
        GAMESCREEN.classList.remove('east-west')
    }
    
}



document.addEventListener('DOMContentLoaded', (event) => {
    set_DOM()
    DOM_MATRIX();
    CURRENT = document.getElementById("5:10");
    CURRENT.classList.add("ball")
    RunBounce();

});