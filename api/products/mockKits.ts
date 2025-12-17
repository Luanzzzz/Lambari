/**
 * Mock Kit Data for n8n API
 * 5 kits realistas com marcas variadas
 */

import { KitSearchResult } from './types';

export const MOCK_KITS: KitSearchResult[] = [
    {
        id: 'kit-verao-tropical-01',
        nome: 'Kit Verão Tropical',
        tipo: 'kit',
        preco: 89.90,
        estoque: 3,
        descricao: 'Kit completo para aproveitar o verão com conforto e estilo. Peças leves e frescas para os dias quentes.',
        tamanhos_disponiveis: ['6-9 meses', '9-12 meses'],
        cores_disponiveis: ['Azul/Amarelo', 'Verde/Laranja'],
        produtos_inclusos: [
            {
                nome: 'Body Manga Curta Tropical',
                marca: "Carter's",
                cor: 'Azul com estampa abacaxi'
            },
            {
                nome: 'Shorts Saruel',
                marca: 'Tip Top',
                cor: 'Amarelo'
            },
            {
                nome: 'Chapéu de Praia',
                marca: 'Pimpolho',
                cor: 'Azul'
            }
        ],
        imagem_url: '/images/kits/kit-verao-tropical.jpg'
    },
    {
        id: 'kit-inverno-quentinho-02',
        nome: 'Kit Inverno Quentinho',
        tipo: 'kit',
        preco: 120.00,
        estoque: 5,
        descricao: 'Kit aconchegante para os dias frios. Peças macias e quentinhas para manter seu bebê protegido.',
        tamanhos_disponiveis: ['RN', '1-3 meses'],
        cores_disponiveis: ['Rosa/Branco', 'Azul/Cinza', 'Bege'],
        produtos_inclusos: [
            {
                nome: 'Macacão Plush com Capuz',
                marca: 'Gerber',
                cor: 'Rosa com orelhinhas'
            },
            {
                nome: 'Body Manga Longa Térmico',
                marca: "Carter's",
                cor: 'Branco'
            },
            {
                nome: 'Calça com Pé',
                marca: 'Tip Top',
                cor: 'Rosa'
            },
            {
                nome: 'Touca de Malha',
                marca: 'Pimpolho',
                cor: 'Rosa claro'
            },
            {
                nome: 'Luvas Antiarranhão',
                marca: 'Gerber',
                cor: 'Branco'
            }
        ],
        imagem_url: '/images/kits/kit-inverno-quentinho.jpg'
    },
    {
        id: 'kit-passeio-chique-03',
        nome: 'Kit Passeio Chique',
        tipo: 'kit',
        preco: 150.00,
        estoque: 2,
        descricao: 'Kit elegante para passeios especiais. Peças sofisticadas para seu bebê arrasar em qualquer ocasião.',
        tamanhos_disponiveis: ['3-6 meses'],
        cores_disponiveis: ['Marinho/Branco', 'Bordô/Bege'],
        produtos_inclusos: [
            {
                nome: 'Conjunto Social Camisa + Calça',
                marca: 'Paola Da Vinci',
                cor: 'Azul marinho com listras'
            },
            {
                nome: 'Sapatinho Mocassim',
                marca: 'Pimpolho',
                cor: 'Marrom'
            },
            {
                nome: 'Blazer Mini',
                marca: 'Tip Top',
                cor: 'Azul marinho'
            },
            {
                nome: 'Gravata Borboleta',
                marca: 'Tip Top',
                cor: 'Vermelha'
            }
        ],
        imagem_url: '/images/kits/kit-passeio-chique.jpg'
    },
    {
        id: 'kit-primeiros-dias-04',
        nome: 'Kit Primeiros Dias',
        tipo: 'kit',
        preco: 78.50,
        estoque: 10,
        descricao: 'Kit essencial para recém-nascidos. Tudo que você precisa para os primeiros dias do bebê em casa.',
        tamanhos_disponiveis: ['RN'],
        cores_disponiveis: ['Branco', 'Amarelo Claro', 'Verde Água'],
        produtos_inclusos: [
            {
                nome: 'Body Kimono Manga Longa (3 unidades)',
                marca: 'Gerber',
                cor: 'Branco, Amarelo, Verde'
            },
            {
                nome: 'Calça com Pé (2 unidades)',
                marca: "Carter's",
                cor: 'Branco e Bege'
            },
            {
                nome: 'Touca Suedine',
                marca: 'Pimpolho',
                cor: 'Branco'
            },
            {
                nome: 'Par de Meias RN',
                marca: 'Tip Top',
                cor: 'Branco'
            }
        ],
        imagem_url: '/images/kits/kit-primeiros-dias.jpg'
    },
    {
        id: 'kit-festinha-05',
        nome: 'Kit Festinha',
        tipo: 'kit',
        preco: 95.00,
        estoque: 1,
        descricao: 'Kit especial para festas e comemorações. Seu bebê será a estrela de qualquer evento!',
        tamanhos_disponiveis: ['9-12 meses'],
        cores_disponiveis: ['Rosa/Dourado', 'Azul/Prata'],
        produtos_inclusos: [
            {
                nome: 'Vestido de Festa com Tule',
                marca: 'Paraíso',
                cor: 'Rosa com detalhes dourados'
            },
            {
                nome: 'Tiara com Laço',
                marca: 'Pimpolho',
                cor: 'Dourada'
            },
            {
                nome: 'Sapatilha de Festa',
                marca: 'Tip Top',
                cor: 'Rosa cintilante'
            },
            {
                nome: 'Calcinha Tapa Fralda',
                marca: "Carter's",
                cor: 'Rosa'
            }
        ],
        imagem_url: '/images/kits/kit-festinha.jpg'
    }
];
