// @ts-ignore
import selfsigned from 'selfsigned'

const generateSelfCertificate = (
  attributes: any,
): { private: string; public: string; cert: string } =>
  selfsigned.generate(attributes, {
    algorithm: 'sha256',
    days: 30,
    keySize: 2048,
    extensions: [
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true,
      },
      {
        name: 'extKeyUsage',
        serverAuth: true,
        clientAuth: true,
        codeSigning: true,
        timeStamping: true,
      },
      {
        name: 'subjectAltName',
        altNames: [
          {
            // type 2 is DNS
            type: 2,
            value: 'localhost',
          },
          {
            type: 2,
            value: 'localhost.localdomain',
          },
          {
            type: 2,
            value: 'lvh.me',
          },
          {
            type: 2,
            value: '*.lvh.me',
          },
          {
            type: 2,
            value: '[::1]',
          },
          {
            // type 7 is IP
            type: 7,
            ip: '127.0.0.1',
          },
          {
            type: 7,
            ip: 'fe80::1',
          },
        ],
      },
    ],
  })

export default generateSelfCertificate
