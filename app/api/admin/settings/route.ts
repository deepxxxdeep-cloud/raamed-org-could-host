import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
export async function GET(){try{const value=await (await getDb()).collection('settings').findOne({_id:'site'});return NextResponse.json(value||{phone:'',whatsapp:'',email:''})}catch{return NextResponse.json({phone:'',whatsapp:'',email:''})}}
export async function PUT(req:Request){const body=await req.json();await (await getDb()).collection('settings').updateOne({_id:'site'},{$set:{phone:body.phone,whatsapp:body.whatsapp,email:body.email,updatedAt:new Date()}},{upsert:true});return NextResponse.json({ok:true})}
