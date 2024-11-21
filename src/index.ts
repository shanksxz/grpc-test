import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { ProtoGrpcType } from './generated/test';
import { AddressBookServiceHandlers } from './generated/AddressBookService';

const packageDefinition = protoLoader.loadSync(path.join(__dirname, './test.proto'));

const personProto = (grpc.loadPackageDefinition(packageDefinition) as unknown) as ProtoGrpcType;

const PERSONS = [
    {
        name: "somya",
        age: 19
    },
    {
      name: "shivansh",
      age: 22
    },
];

const handler: AddressBookServiceHandlers = {
  AddPerson: (call, callback) => {
    let person = {
      name: call.request.name,
      age: call.request.age
    }
    // can do db call instead of in-memory
    PERSONS.push(person);
    callback(call,person);
  },
  GetPersonByName: (call, callback) => {
    const person = PERSONS.find(p => p.name === call.request.name);
    if (person) {
      callback(call,person);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: 'Not found'
      });
    }
  }
}

const server = new grpc.Server();

server.addService((personProto.AddressBookService).service, handler);
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Server running at http://localhost:50051');
    server.start();
});
