import {bounds,LEVEL} from './plan';

// Elevation composition is independent of room iteration. Coordinates along a face are Z.
export interface FacadeOpening {at:number;width:number;sill:number;head:number;door?:string}
export interface SideWall {name:string;x:number;from:number;to:number;level:number;material:'plaster'|'stone';inset:number;openings:FacadeOpening[]}
export const ENVELOPE={
 wallDepth:.48,reveal:.22,edgeDepth:.55,guard:1.1,
 westLoggia:bounds(-13,-10,3,11),eastLoggia:bounds(14.4,17,-3,4),
 foyerPortal:{x:0,z:-2.1,length:5.8,width:4.8,head:3.65},
 stairTower:bounds(-6.2,-1.8,-5.3,3.2),towerTop:10.85,
} as const;
export const sideWalls:SideWall[]=[
 {name:'Travertine west front return',x:-13.4,from:-6.8,to:-3,level:0,material:'stone',inset:.22,openings:[]},
 {name:'West continuous stone base',x:-13,from:-3,to:11,level:0,material:'stone',inset:.22,openings:[
  {at:-.4,width:2.8,sill:1.1,head:3.35},{at:5.65,width:3.6,sill:1.3,head:3.35},{at:9.3,width:1,sill:2.5,head:3.35}]},
 {name:'West quiet upper front',x:-13,from:-3,to:3,level:LEVEL.upper,material:'stone',inset:.22,openings:[
  {at:-1.1,width:1.6,sill:.7,head:3.5},{at:2,width:.8,sill:2.5,head:3.5}]},
 {name:'West loggia inner wall',x:-10,from:3,to:11,level:LEVEL.upper,material:'plaster',inset:.22,openings:[
  {at:5.6,width:2.4,sill:0,head:3.35,door:'Suite 04 west loggia'},{at:9,width:1,sill:2.5,head:3.35}]},
 {name:'West projecting garden base',x:-15,from:11,to:20,level:0,material:'plaster',inset:.22,openings:[
  {at:14.9,width:3.6,sill:1.2,head:3.35},{at:18.5,width:1,sill:2.5,head:3.35}]},
 {name:'West primary solid volume',x:-15,from:11,to:20,level:LEVEL.upper,material:'plaster',inset:.22,openings:[
  {at:15.2,width:1.8,sill:.65,head:3.5},{at:18.5,width:1,sill:2.5,head:3.5}]},
 {name:'East cinema stone base',x:17,from:-3,to:4,level:0,material:'stone',inset:-.22,openings:[
  {at:.5,width:3.8,sill:3.3,head:3.8}]},
 {name:'East wellness wall',x:17,from:4,to:10,level:0,material:'plaster',inset:-.22,openings:[
  {at:7.2,width:2.2,sill:1.3,head:3.4}]},
 {name:'East kitchen and pantry',x:17,from:10,to:20,level:0,material:'plaster',inset:-.22,openings:[
  {at:13,width:3.2,sill:1.35,head:3.5}]},
 {name:'East family loggia inner wall',x:14.4,from:-3,to:3.6,level:LEVEL.upper,material:'plaster',inset:-.22,openings:[
  {at:.5,width:2.2,sill:0,head:3.35,door:'Family lounge east loggia'},{at:2.5,width:.8,sill:.5,head:3.35}]},
 {name:'East quiet link',x:17,from:4,to:10,level:LEVEL.upper,material:'stone',inset:-.22,openings:[
  {at:7,width:1.25,sill:1.1,head:3.5}]},
 {name:'East garden suite',x:17,from:10,to:20,level:LEVEL.upper,material:'plaster',inset:-.22,openings:[
  {at:13.2,width:4.4,sill:.75,head:3.5}]},
];

// Front proportions derived from the approved image; metre assumptions, not surveyed dimensions.
export const FRONT={
 left:{minX:-13.4,maxX:-2.2,faceZ:-6.8,recessZ:-3,openingMin:-12,openingMax:-6.2,top:8.95},
 slot:{x:-1.15,width:1.35,frontZ:-5.3,top:8.7},
 frame:{minX:0,maxX:9.6,frontZ:-8,backZ:-3,thickness:.85,top:9.5},
 quiet:{minX:9.6,maxX:17,frontZ:-3,top:9.05},
};
