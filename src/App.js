import './App.css';
import input from './data/input.js';
import {useState, useEffect} from "react";

let myInput = input.toString().trim().split('\r\n\n');
myInput = myInput.map(x => x.split(''));
//console.log(myInput)

function App() {
    const [data, setData] = useState({
        locations: new Map(),
        foreignLocations: [],
        allNodes: [],
        pathIds: [],
        endFound: false,
        startFound: false,
        visStart: false
    })
    const handleData = (obj) => {
        setData(obj);
    }
    //let data = data;

    class Location {
        constructor(xPos, yPos, distance, pathArr) {
            this.xPos = xPos;
            this.yPos = yPos;
            this.name = `x${xPos}y${yPos}`
            this.heightVal = null;
            this.distanceFromStart = distance;
            this.isFinish = false;
            this.pathToSelf = pathArr??[];
            this.identify(myInput[this.yPos][this.xPos]);
        }
        traverseLocation = () => {
            //loop through neighboring locations, checking if they are passable
            for(let y=this.yPos-1;y<=this.yPos+1;y++){
                //if location is out of bounds
                if(y<0 || y>myInput.length-1)continue;
                for(let x=this.xPos-1;x<=this.xPos+1;x++){
                    //if location is out of bounds
                    if(x<0 || x>myInput[0].length-1)continue;
                    //if location is current location
                    if(x===this.xPos && y===this.yPos)continue;

                    //if location has been found
                    if(data.foreignLocations.some(item=>(item.xPos===x && item.yPos===y)))continue;

                    //if moving diagonally
                    if(Math.abs(this.xPos - x) === 1 && Math.abs(this.yPos - y) === 1 )continue;

                    //is there a shorter route
                    if(data.locations.get(`x${x}y${y}`)?.distanceFromStart <= this.distanceFromStart)continue;

                    let locationValue = myInput[y][x];
                    if(locationValue === 'S'){
                        locationValue = 'a';
                    }
                    else if (locationValue === 'E'){
                        locationValue = 'z';
                    }
                    let isLocationReachable = (locationValue.charCodeAt(0)-96) - this.heightVal >= -1
                    if(isLocationReachable){
                        this.pathToSelf.push(this)


                        data.foreignLocations.push(new Location(x,y,this.distanceFromStart+1,[...this.pathToSelf]));
                        data.allNodes[y][x] = new Location(x,y,this.distanceFromStart+1,[...this.pathToSelf]);
                        //.log(new Location(x,y,this.distanceFromStart+1),this.pathToSelf)
                    }
                }
            }

            if(this.isFinish){
                data.locations.set('end',this)
                data.endFound = true;
            }else {
                data.locations.set(`x${this.xPos}y${this.yPos}`,this)
            }
        }
        identify = () => {
            let value = myInput[this.yPos][this.xPos];
            if(value === 'E'){
                value = 'z';
                this.distanceFromStart = 0;
            }
            else if (value === 'S' || value === 'a'){
                value = 'a';
                this.isFinish = true;
            }
            this.heightVal = value.charCodeAt(0)-96;
        }
    }



    //console.log(data.visStart);

    const handleStart = () => {
        let newData = {...data};
        //console.log('button start')
        newData.visStart=true;

        //console.log(`data: ${data.visStart}, expected false`)
        //console.log(`newData: ${newData.visStart}, expected true`)

        handleData(newData);
    }
    const handleReset = () => {
        let newData = {}
        newData.locations = new Map();
        newData.foreignLocations = [];
        newData.allNodes = [];
        newData.pathIds = [];
        newData.endFound = false;
        newData.startFound = false;
        newData.visStart = false;
        handleData(newData);
    }

    useEffect(()=>{
        let newData = {...data}
        //console.log('useEffect')

        if(!data.startFound){
            //find start
            for(let i=0;i<myInput.length;i++){
                newData.allNodes.push([]);
                for(let j=0;j<myInput[i].length;j++){
                    if(myInput[i][j]==='E'){
                        newData.foreignLocations.push(new Location(j,i,0, []));
                        newData.startFound = true;
                    }
                    newData.allNodes[i][j] = new Location(j,i,Infinity, []);
                }
            }
            handleData(newData)
        }

        else if(newData.visStart && !newData.endFound){

            console.log(newData.pathIds);
            newData.foreignLocations[0].traverseLocation();
            newData.pathIds = newData.foreignLocations[0].pathToSelf.map(x => x.name );
            if(newData.foreignLocations[0].isFinish){
                newData.endFound = true;
            }
            if(newData.foreignLocations.length>0)newData.foreignLocations.shift();

            //console.log('test');
            handleData(newData);

        }
    },[data])


  return (
    <div className="App d-flex">
        <div className={``}>
            <button className={`m-2 button`} onClick={() => handleStart(data)}>Start</button>
            <button className={`m-2 button`} onClick={() => handleReset()}>Reset</button>
        </div>

        {
        data.allNodes.map((row,i) =>
            (<div className={`row ${i}`}>
                {
                    row.map((node,j)=>
                        (<div id={`x${node.xPos}y${node.yPos}`} className={`tile height${node.heightVal} distance${Math.floor(node.distanceFromStart/17)} ${data.pathIds.includes(`x${node.xPos}y${node.yPos}`)?` selectedPath `:' '}`}><p>{node.heightVal}</p></div>)
                    )
                }
            </div>)
        )
        }
    </div>
  );
}

export default App;
