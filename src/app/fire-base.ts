import admin, { ServiceAccount } from 'firebase-admin';

export const FirebaseServiceAccount: ServiceAccount = {
    projectId: "electra-453506",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQChpDpdKuQp6xqV\ncwaf95FItVbQEpZKqJxoP8COUsE99nRB6Mh/LuAqnzBEZSO5wndYsMU6kYvhI+FZ\nXSiDdTJ/sb4tzNmYEk2jYp+IcKNREKI9iR83lY7zpRzwwbzTXQnMnoal7EFFGGP0\n6MFpa5Z6KGARoic6y9j0NHCN3v85/nAEXYz0ftNSB04gnwk/33C3fuVzxWapPk0f\npJVnUeFcjlZMqxq9xKZnSLUXLUP3hY5EyoGlDvyN1IxY6i9cTkKW6wjFTnC1el6v\nzU76dEn5QyOpzTaL5k3zabahFZGBERBhAEIava6cnJQUvVawLgwk4d+xqmQ+apio\nv56molTnAgMBAAECggEAGO8PBwrJYfifg9OCf2/ePAD9AIuyyJbJyar2i6hoS/lA\nZbUAIzOakKM4UX89y4xxLH/YF04W7bEYidhnmh+cnTtQbXA0AH6SS1RjQitd20YI\nQMXDcvzhrY5tWxYHh/MfbS48RvadUDM6+ARkvAZEkq4NDlXyXIzP9/Dpi843leen\n9HGZYyFURgGHnrhv4eeij+LX+AfFhmPy8NWd/Glp1FL4tkiIHX/Qt1MvPLYaGSrX\npmYEa4eBCqJSPS5X4FVz59ku1Msu/vLc9CjqjdBYM6c8+VTi82vyKHqfAjM8RvGD\ng//NkrRP3ADcC5wu2PVjUsD2IMtQVI9CZLMLuflqQQKBgQDiCauSBYX7aqW+Inqb\n32IRDBaJHSozWJ4SnjmAz8+ADYMpYdf6qa4daz0rbnonmJ//j90ZPQFXfsUDMfGf\nvaOfT6zlsz1buqiisv4zAMkrh3CSQP7vNHjoU3VIXb+9HONsk71lx7FRLo+dfxsD\nfLIt1KzHXtoDzZoQw0iKxj+QmwKBgQC3EVhszTTkJK9ZBLDr7utU8daAzGHc/iLu\nAoS0HCZzdrI/hfkvL+lWFwZxJhmDkpDbL1kLUC8XMfSJO3wc/Xn6QXEE78dhTOL9\ng8jcmSofWzb3f3K8oWYZAM3z2NqPujKkZ66YmPW+3YWRUFgd28rV76scvGRNiTPk\nPg9GmSXzpQKBgBITheX6jRlrEPAgn7+BYL1OQysZ6vsKNjH091JGzChIbFnN2lDQ\nav0tS0oC3r/1462zWpIfH9FYcPbtco48wy4FWCVSbTC9v6irOcroYC4b+bOogPqu\nLpEdw35TCPddrQ5MzlOqYZLFb3S/6nAf87vYiyyyeCrfsVdv1ohKjGDLAoGAR7Gx\nUZrj9d0wFsqxhxSgcTns6bAhO20DvPabhfXoURvRHvOW7RX0adTGnxVutIp31H8s\nfjO+3XSg8gWry6axWIK8glRtXvu/gc1UoqARUQpl8nOlOZ5z36LjBXaN0e/32U8J\nn5V32HHk104B1F+5hiNAfhaBqaPsAJ0VWm6r4EkCgYB09PSwC4nta3ZuNHBUIDhW\n+5m8aP0dDZNvy82fvNCygJdidu4kjuvzluo9YNDy7l+uPsr18ULIsVKehcW/pQ8F\n7ipcPLrZGgoE8xu6Igjl1ccTCI4obXRbQ2apTYOli0Pbe8sACq4XoniSEAIq7mT9\nohptw3p48fGWopnsESVzZQ==\n-----END PRIVATE KEY-----\n",
    clientEmail: "electra@electra-453506.iam.gserviceaccount.com",
};


// {
//     "type": "service_account",
//     "project_id": "electra-453506",
//     "private_key_id": "ac7c4df8f54c7994450811aebff4f6e2f9dcdace",
//     "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQChpDpdKuQp6xqV\ncwaf95FItVbQEpZKqJxoP8COUsE99nRB6Mh/LuAqnzBEZSO5wndYsMU6kYvhI+FZ\nXSiDdTJ/sb4tzNmYEk2jYp+IcKNREKI9iR83lY7zpRzwwbzTXQnMnoal7EFFGGP0\n6MFpa5Z6KGARoic6y9j0NHCN3v85/nAEXYz0ftNSB04gnwk/33C3fuVzxWapPk0f\npJVnUeFcjlZMqxq9xKZnSLUXLUP3hY5EyoGlDvyN1IxY6i9cTkKW6wjFTnC1el6v\nzU76dEn5QyOpzTaL5k3zabahFZGBERBhAEIava6cnJQUvVawLgwk4d+xqmQ+apio\nv56molTnAgMBAAECggEAGO8PBwrJYfifg9OCf2/ePAD9AIuyyJbJyar2i6hoS/lA\nZbUAIzOakKM4UX89y4xxLH/YF04W7bEYidhnmh+cnTtQbXA0AH6SS1RjQitd20YI\nQMXDcvzhrY5tWxYHh/MfbS48RvadUDM6+ARkvAZEkq4NDlXyXIzP9/Dpi843leen\n9HGZYyFURgGHnrhv4eeij+LX+AfFhmPy8NWd/Glp1FL4tkiIHX/Qt1MvPLYaGSrX\npmYEa4eBCqJSPS5X4FVz59ku1Msu/vLc9CjqjdBYM6c8+VTi82vyKHqfAjM8RvGD\ng//NkrRP3ADcC5wu2PVjUsD2IMtQVI9CZLMLuflqQQKBgQDiCauSBYX7aqW+Inqb\n32IRDBaJHSozWJ4SnjmAz8+ADYMpYdf6qa4daz0rbnonmJ//j90ZPQFXfsUDMfGf\nvaOfT6zlsz1buqiisv4zAMkrh3CSQP7vNHjoU3VIXb+9HONsk71lx7FRLo+dfxsD\nfLIt1KzHXtoDzZoQw0iKxj+QmwKBgQC3EVhszTTkJK9ZBLDr7utU8daAzGHc/iLu\nAoS0HCZzdrI/hfkvL+lWFwZxJhmDkpDbL1kLUC8XMfSJO3wc/Xn6QXEE78dhTOL9\ng8jcmSofWzb3f3K8oWYZAM3z2NqPujKkZ66YmPW+3YWRUFgd28rV76scvGRNiTPk\nPg9GmSXzpQKBgBITheX6jRlrEPAgn7+BYL1OQysZ6vsKNjH091JGzChIbFnN2lDQ\nav0tS0oC3r/1462zWpIfH9FYcPbtco48wy4FWCVSbTC9v6irOcroYC4b+bOogPqu\nLpEdw35TCPddrQ5MzlOqYZLFb3S/6nAf87vYiyyyeCrfsVdv1ohKjGDLAoGAR7Gx\nUZrj9d0wFsqxhxSgcTns6bAhO20DvPabhfXoURvRHvOW7RX0adTGnxVutIp31H8s\nfjO+3XSg8gWry6axWIK8glRtXvu/gc1UoqARUQpl8nOlOZ5z36LjBXaN0e/32U8J\nn5V32HHk104B1F+5hiNAfhaBqaPsAJ0VWm6r4EkCgYB09PSwC4nta3ZuNHBUIDhW\n+5m8aP0dDZNvy82fvNCygJdidu4kjuvzluo9YNDy7l+uPsr18ULIsVKehcW/pQ8F\n7ipcPLrZGgoE8xu6Igjl1ccTCI4obXRbQ2apTYOli0Pbe8sACq4XoniSEAIq7mT9\nohptw3p48fGWopnsESVzZQ==\n-----END PRIVATE KEY-----\n",
//     "client_email": "electra@electra-453506.iam.gserviceaccount.com",
//     "client_id": "111414756873071356798",
//     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
//     "token_uri": "https://oauth2.googleapis.com/token",
//     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
//     "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/electra%40electra-453506.iam.gserviceaccount.com",
//     "universe_domain": "googleapis.com"
//   }
  


