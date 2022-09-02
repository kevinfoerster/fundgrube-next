import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { inspect } from '@xstate/inspect';

import { assign, createMachine } from 'xstate';
import { useMachine } from '@xstate/react';


const fetchInitialData = async () => {
  const result = await fetch('/api/postings?limit=24&offset=0');
  return result.json()
}
const fundgrubeMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QDMCuA7aAnVAjMAdAJbpEAuRAhgDYDKZlZYAxBAPbqEkBubA1oTSYoOfMVIUa9RmAQ82AY0ZEOAbQAMAXUSgADm1jkV6HSACeiABwBOAtcsB2AEwAWAKwBGAGzWPAZj91NwAaEAAPRCc-BwJ1P2sHD3Vrezc-Ty8AX0zQoWw8LgkqOgYmZjAsLDYsAl1qRmRqgFsCPJEC8SMpUtl5JQo1LVN9QwGTJHDED2mCPxsvF3UHP385r1CLBABaDxibDOt1Sw83JycUl2zcjHyxIghqFgVqIgU+ADEiaiYsYYMjDimCIILzOAiWdQeSxuRKLLwwjwbRA7fyxKFOdQuFYBBJXEBtUSESi6OpmT7fCqsDiFXgCVo3dpiYmk8k-OToXj9YwabQTEYA8agYGnDwEFyWSwYrx+eHWTyI8xTawuOxYlzqo4OBwpNx4gkdZnUMlfH7lSrVWr1MiNLAtfVMklG1kVdmc5SDXl6f5jIGIFyuWJeTH+LHWJwnaxIhBnSwEDEOSwuE7qKUOS549BsCBwUz2wpdEoyP6jYy+hD+qM2OyOVwHVZBPUMwnEB5gYsCstY9TgrEnBbTeUKzYeFX+oNueH+3aHJxZHL4psGx3Gim-Pne0sTYGSmIykPTFwJmyWKNbFZxuVhmE2BJzI6N4SE9s+rdTE+K7ZQtyxIKLEeg5UAj8bJsiAA */
  createMachine({
  context: {
    categories: [],
    outlets: [],
    brands: [],
    filter: {
      categories: [],
      brands: [],
      outlets: [],
    },
  },
  id: "fundgrube",
  initial: "initialState",
  states: {
    initialState: {
      invoke: {
        src: "initialRequest",
        onDone: [
          {
            actions: "storeData",
            target: "idle",
          },
        ],
        onError: [{}],
      },
    },
    idle: {
      on: {
        clickFilter: {
          actions: "toggleFilter",
          target: "applyFilter",
        },
      },
    },
    applyFilter: {
      invoke: {
        src: "requestWithFilters",
        onDone: [
          {
            actions: "updatePostings",
            target: "idle",
          },
        ],
        onError: [{}],
      },
    },
    
  },
}, {
    actions: {
      'updatePostings': assign((context, event) => {
        return {postings:  event.data.postings}
      }),
      'storeData': assign((context, event) => (event.data)),
      'toggleFilter': assign((context, event) => {
        
        const filterType = event.payload.type
        const value =event.payload.id
      
        const filterAlreadyExists = context.filter[filterType].indexOf(value) !== -1

        const newFilter = filterAlreadyExists ? context.filter[filterType].filter((item) => item !== value) : [...context.filter[filterType], value]
        return {
          filter: {
            ...context.filter,
            [filterType]: newFilter
          }
        }
      }),
    },
    guards: {

    },
    services: {
      initialRequest: async () => {
        const params = {
          limit: 24,
          offset: 0,
        };
        const searchParams = new URLSearchParams(params);
        const result = await fetch(
          `/api/postings?${searchParams.toString()}`
        );
        return result.json();
      },
      requestWithFilters:  async (context, event) => {
        const params = {
          limit: 24,
          offset: 0,
          outletIds: context.filter.outlets,
          brands: context.filter.brands,
          categorieIds: context.filter.categories,
        };
        const searchParams = new URLSearchParams(params);
        const result = await fetch(
          `/api/postings?${searchParams.toString()}`
        );
        return result.json();
      }
    }
  });


if (typeof window !== "undefined") {
  inspect({
    // options
    // url: 'https://stately.ai/viz?inspect', // (default)
    iframe: false // open in new window
  });
}
export default function Home() {
  const [state, send] = useMachine(fundgrubeMachine, {
    devTools: true
  })
  return <div>
    <h1>fundgrube</h1>
    {state.value}
    {state.context.filter.categories.map(category => <button key={`filter_category_${category}`}onClick={() => send({
              type: 'clickFilter', payload: {
                id: category,
                type: 'categories'
              }
            })}>{category}</button>)}
    {state.context.filter.brands.map(brand => <button>{brand}</button>)}
    {state.context.filter.outlets.map(outlet => <button>{outlet}</button>)}
    <main style={{ display: 'grid', gridTemplateColumns: '1fr 2fr' }}>
      <div>
        <ul>
          {state.context.categories?.map(category => {
            return <li key={category.id} onClick={() => send({
              type: 'clickFilter', payload: {
                id: category.id,
                type: 'categories'
              }
            })}>{category.name}</li>
          })}
        </ul>
        <ul>
          {state.context.outlets?.map(outlet => {
            return <li key={outlet.id}  onClick={() => send({
              type: 'clickFilter', payload: {
                id: outlet.id,
                type: 'outlets'
              }
            })}>{outlet.name}</li>
          })}
        </ul>
        <ul>
          {state.context.brands?.map(brand => {
            return <li key={brand.id} onClick={() => send({
              type: 'clickFilter', payload: {
                id: brand.name,
                type: 'brands'
              }
            })}>{brand.name}</li>
          })}
        </ul>
      </div>
      <div><ul>
        {state.context.postings?.map(posting => {
          return <li key={posting.id}>{posting.name}</li>
        })}
      </ul></div>
    </main>
  </div>
}
