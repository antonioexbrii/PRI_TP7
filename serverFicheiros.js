var express=require('express')
var http=require('http')
var url=require('url')
var logger=require('morgan')
var pug=require('pug')
var fs=require('fs')
var formidable=require('formidable')
var {parse}=require('querystring')
var jsonfile=require('jsonfile')

var app=express()
var ficheiros='data/ficheiros.json'

app.use(logger('combined'))
app.all('*',(req,res,next)=>{
	if(req.url=='/'){
		res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'})
	}
	else if(req.url=='/w3.css'){
		res.writeHead(200,{'Content-Type':'text/css;charset=utf-8'})
	}
	next()
})
app.get('/',(req,res)=>{
	jsonfile.readFile(ficheiros,(err3,lista)=>{
		if(!err3){
			res.write(pug.renderFile('index.pug',{lst:lista}))
			res.end()
		}
		else res.write(pug.renderFile('index.pug'))
		res.end()
	})
})
app.get('/w3.css',(req,res)=>{
	fs.readFile('stylesheet/w3.css',(err,data)=>{
		if(!err) res.write(data)
		else res.write(pug.renderFile('erros.pug',{e:err}))
		res.end()
	})
})
app.post('/processaForm',(req,res)=>{
	var form=new formidable.IncomingForm()
	form.parse(req,(err,fields,files)=>{
		var fenviado=files.ficheiro.path
		var fnovo='./uploaded/'+files.ficheiro.name
		fs.rename(fenviado,fnovo,(err2)=>{
			if(!err2){
				var info={"ficheiro":files.ficheiro.name,"desc":fields.desc}
				jsonfile.readFile(ficheiros,(err3,lista)=>{
					if(!err3){
						lista.push(info)
						jsonfile.writeFile(ficheiros,lista,err4=>{
							if(!err4)
								console.log('S: lista de ficheiros atualizada ---------')
							else res.write(pug.renderFile('erros.pug',{e:err4}))
						})
						res.write(pug.renderFile('index.pug',{lst:lista}))
						res.end()
					}
					else res.write(pug.renderFile('erros.pug',{e:err3}))
				})
			}
			else
				res.write(pug.renderFile('erros.pug',{e:err2}))
		})
	})
})
app.get(/\/uploaded\/*.*/,(req,res)=>{
	var purl=url.parse(req.url,true)
	fs.readFile('./'+purl.pathname,(err,data)=>{
		if(!err){
			if(/\/(uploaded)\/[a-zA-Z0-9]+(.jpe?g)/.test(purl.pathname)){
				res.writeHead(200,{'Content-Type':'image/jpg'})
			}
			else if(/\/(uploaded)\/[a-zA-Z0-9]+(.txt)/.test(purl.pathname)){
				res.writeHead(200,{'Content-Type':'text/plain'})
			}
			else if(/\/(uploaded)\/[a-zA-Z0-9]+.(.png)$/.test(purl.pathname)){
				res.writeHead(200,{'Content-Type':'image/png'})
			}
			else if(/\/(uploaded)\/[a-zA-Z0-9]+.(.json)$/.test(purl.pathname)){
				res.writeHead(200,{'Content-Type':'text/json'})
			}
			else {
				res.writeHead(200,{'Content-Type':'text/plain'})
				console.log('Nao foi possivel aplicar o formato do ficheiro.')
			}
			res.write(data)
		}
		else res.write(pug.renderFile('erros.pug',{e:err}))
		res.end()
	})
})

http.createServer(app).listen(4007,()=>{console.log('SERVER ABERTO PORTA 4007')})