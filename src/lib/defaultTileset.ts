const DEFAULTTILESET = JSON.parse(`[
    {
        "display": "Plains",
        "bgColor": 11462236,
        "id": "default_Plains",
        "symbol": null
    },
    {
        "display": "Desert",
        "bgColor": 16772676,
        "id": "default_Desert",
        "symbol": null
    },
    {
        "display": "Beach",
        "bgColor": 16318111,
        "id": "default_Beach",
        "symbol": null
    },
    {
        "display": "Deep Water",
        "bgColor": 1465244,
        "id": "default_Deep-Water",
        "symbol": null
    },
    {
        "display": "Water",
        "bgColor": 11788537,
        "id": "default_Water",
        "symbol": null
    },
    {
        "display": "Tree",
        "bgColor": 9225791,
        "id": "default_Tree",
        "symbol": {
            "texId": "Tree",
            "color": 4029989,
            "texWidth": 100,
            "texHeight": 100,
            "pHex": 80,
            "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKVSURBVHhe7Z2LUsIwEEXBz9Lv199CV8kMlIKkZXfPJvfMdEBmSkpObl5WOZ5Op4Pg8HZ+FBAkBIaEwJAQGBICQ0JgSAiMzHXI3oKP58ehiE7I+89hIl7RCl71PigiE+JZ0DIta2WVSFRUQrytX77/vbLs9XZgGWlQ76lorJwIIZEfektZdo6NbQgixhBcK3xA+jijdcg16Y1HQm5JlSIh66RJiRAy5Irai6iEVJSSkpLILsuktOPDXhC3ZGwups9kOghPdvSgjlmAUYkSYqmw4/P3pzqENyCt1P8ntNvyTkh1GUZLd8hn8RQygowl7mK8hIwoI4ToWdYouDU4DyGzpMPlcyohMCQEhoTAkBAYHkLCN+RGwishkrIRzy7LpEhMJxFjSBMjOU8QNajbIkrbKU8QIUQiOvAWIhmdRHVZI+IyJnoKUTo2oIRsw23G6Pk79eoJSZmmKyEwPIVoIbgB74RISicRXZZJseMV9/P2Ct7aINIaUsa9vUZvoZcV1HOunbenrHCyhCy5dxFrldMrxHjmnFQRDYqQHrYIKYOmvTAkBIaEwJAQGBICo5qQclPCXpQQGBICo5KQ4bsrQwmBISEwJASGhMCoImSKAd1QQmBICAwJgVFByJ7xo9zYo4TAoAuZZnbVUEJgzCCkVMrIQqbrroxZuqwycqlCPCqwxH9Epd656HVR+DsZiQnxbCH4rosmJKLC0FJIQiIryspCiplllnUPnBSKkMyKQUkhCCFUiF0DQszsXdaSdDHZQhCtcoU0MUrIY8KlSMgttpq/PEIhbJ1kXwBqO4WQkNYSI74ozMpo5bUDBXVz0XZm93w9klX819/TWlT8O/Wh0aAOQ0JgSAgMCYEhITAkBIaEwJAQFIfDN2Shgz9c4BjXAAAAAElFTkSuQmCC"
        }
    },
    {
        "display": "Fire Tree",
        "bgColor": 16772676,
        "id": "default_Fire-Tree",
        "symbol": {
            "texId": "Fire-Tree",
            "color": 11158545,
            "texWidth": 100,
            "texHeight": 100,
            "pHex": 80,
            "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKVSURBVHhe7Z2LUsIwEEXBz9Lv199CV8kMlIKkZXfPJvfMdEBmSkpObl5WOZ5Op4Pg8HZ+FBAkBIaEwJAQGBICQ0JgSAiMzHXI3oKP58ehiE7I+89hIl7RCl71PigiE+JZ0DIta2WVSFRUQrytX77/vbLs9XZgGWlQ76lorJwIIZEfektZdo6NbQgixhBcK3xA+jijdcg16Y1HQm5JlSIh66RJiRAy5Irai6iEVJSSkpLILsuktOPDXhC3ZGwups9kOghPdvSgjlmAUYkSYqmw4/P3pzqENyCt1P8ntNvyTkh1GUZLd8hn8RQygowl7mK8hIwoI4ToWdYouDU4DyGzpMPlcyohMCQEhoTAkBAYHkLCN+RGwishkrIRzy7LpEhMJxFjSBMjOU8QNajbIkrbKU8QIUQiOvAWIhmdRHVZI+IyJnoKUTo2oIRsw23G6Pk79eoJSZmmKyEwPIVoIbgB74RISicRXZZJseMV9/P2Ct7aINIaUsa9vUZvoZcV1HOunbenrHCyhCy5dxFrldMrxHjmnFQRDYqQHrYIKYOmvTAkBIaEwJAQGBICo5qQclPCXpQQGBICo5KQ4bsrQwmBISEwJASGhMCoImSKAd1QQmBICAwJgVFByJ7xo9zYo4TAoAuZZnbVUEJgzCCkVMrIQqbrroxZuqwycqlCPCqwxH9Epd656HVR+DsZiQnxbCH4rosmJKLC0FJIQiIryspCiplllnUPnBSKkMyKQUkhCCFUiF0DQszsXdaSdDHZQhCtcoU0MUrIY8KlSMgttpq/PEIhbJ1kXwBqO4WQkNYSI74ozMpo5bUDBXVz0XZm93w9klX819/TWlT8O/Wh0aAOQ0JgSAgMCYEhITAkBIaEwJAQFIfDN2Shgz9c4BjXAAAAAElFTkSuQmCC"
        }
    },
    {
        "display": "Mountains",
        "bgColor": 11759872,
        "id": "default_Mountains",
        "symbol": {
            "texId": "Mountains",
            "color": 4333568,
            "texWidth": 100,
            "texHeight": 100,
            "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsSAAALEgHS3X78AAACdklEQVR4nO3b4VWzMBiGYXACR3CEjuAIdgNH6Ahu4AiOohvUTeoGj6cVj0ib8BJCSMh9nfP9+WwphaY3ENoAAAAAAAAAAAAAAAAA2ybpSdI9uzkDknaSTpLea98WqzuPCklH/XmpfJOsS9Kbrj3WvE1WI+n5xs5Q9/VFT1LqdcOFnqRyoxsu9CQFRzdc6MmSPN1woSdLMXSDnqQyoRsu9CSmid1woScxGLvxahhB9GQuYzcujZjyWAQwduPfp944muhJCGM3rroQ+jx4zPmkh4ws+HfG7BYs0ZNumbuq9l3MT3fMnvTW61jVyIr9/R9reYPlvM1+oyVY4ggpxohzrNfz1nfGYucQc5btee5psz1JcVQUMvoM67XNnqQ6b5j6OsbHb6snKc+sp4zEifMu2+jJGteejK95nDjvUn5P1jybDph1tCi7J2tfb4o0vzJUZk9yuCIbYQbSpaye5DRnETBH/9798ymnJzlehZ3Qk9+jr3vjQUH+Pcl1niLg/OTR8Pi8e5LzTJ5h5F6t1/n/DO8nz56UMNftWUfnehXZk5Jm726M4rGrwOX1pLT57cH6WuZJyulJiXeA9Ea0eb2K6EnJ90hJegh4Tr49qfGuj6x7Uut9UVn2pPY7B7PqCffW/siiJ9wt+CeLnnA/7X+r9qT2bris0hO64Ze0J3RjXNKe0A2bJD3pvqrG8EuljrEn4V9dkg4jC+e3fAOGnhx8z78bWf7XyN/2c9/ABu0N2y3MSKyq74aLpyfzD35uHPKeNv+7iQi687bhdhvtR2t96d6I+GzbNnzYVaQbDZed0LbtR+3bAwAAAAAAAAAAAAAAAACSa5rmG2xygv09oK+NAAAAAElFTkSuQmCC",
            "pHex": 80
        }
    },
    {
        "display": "tree2",
        "bgColor": 9225791,
        "id": "default_tree2",
        "symbol": {
            "texId": "tree2",
            "color": 4029989,
            "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsSAAALEgHS3X78AAADiUlEQVR4nO2d/W0bMQzFpaIDOBu0EySZoM4ETSaoM0HSCZxO4HYCtxO4Gzgb+DqBs4G9AQsBPOBg2PEHHnWU7v3+TUDp9I6UjqLkQAghhBBCCCGEEEIIIZcQaxg1EbkJIYxCCOM9f25CCNsY42sPXRsGIjISkYmILERkI6ezFJFnEfk09DGEkAZSROZninCIJM4+jyLHUI+YAUTYx1JDHjmF9BaDPOIYLxTkCGmQMgjRJXnLyPWg9IXOFX2woig79ChGC0Vp6SFMHYKiiMi9EzFa5rnHwM2Xur6Na/3i9sRDjPFvrv58cPTgU4diJGY5Q5cLQTSV8eygK/vI2jcvHjJ10If3eMrlJb0Log866bsfR0h9vM/RUK+CpFVVCCH7SuZCnnI0kn2VpfPFVN+40tb5VzHGrWUD2Tykzdjq0nZSoBjhwAYYlCyC6L7D2vFK6lTM0/Tmgmhae1moR+zyxbqBj5bGNfXgfQXlCrNJvVYxYoymCyGTkJUKEGr1DOsPRLjauj+9Qtt1RCorurNa/lp4SCkfepeSXjizrV6oIBqqhlDBkZ5xYWEY7SHek4RIxhaVKrA5RL2j9nC1j9sYY4MyhvSQr0BbJTFD9hXiITrBbRC2CuUOVcyN8pCh18h+QxlCCTL02ljY5hVKkGuQnVIZoSrpUYKwyg8Utj2VAZUOJEpQEByQKEFBnEFBnIES5K2aEekZlCD/ih0BZ6AEgSXXCgYyBhBBNI9jWkBWAJAogZzUs52hcIqr5GLiF9BWaTQxRsjCBiaIbtIM9T4R2MsIrTrRBNsSabMA0tz5GVWFAv0w1Mn9J9JmAfxAlgRZ1GWNtC5rCDfupLnjFmkQnjrRt+VhAMvg9HyPaKMmuSyd4OGddcZ3ZLVJi1lyUc921+opjzHG3xaGzY+0aa3vopI5ZaueYSJGyHXGUCf6ea6TrEY06hn15O30MrKlj2tMTmZT/eVmKsyldyeu9CJLa9baTtYCjt4vn9Gv+3Hn/N5NZ3+60bjdaDb1tc0ZJTHObOpKQ+Z1p422nqxt463TTi+hqdh7e88VxPooGgruqTuDgjiDgjiDgjiDgjiDgjiDgjiDgjiDgjiDgjiDgjiDgjiDgjijZEGqPJMyFEGKKbQoWZA/Z/zv0Cvz86DbucfY8HcLM6GXM78nyoY/iZcZFeVlR5i1/u4hb5gghBBCCBk8hBBCCKmFEMJ/M9N74oLh5I8AAAAASUVORK5CYII=",
            "texWidth": 100,
            "texHeight": 100,
            "pHex": 85
        }
    },
    {
        "display": "hills",
        "bgColor": 16706182,
        "id": "default_hills",
        "symbol": {
            "color": 10053888,
            "texWidth": 100,
            "texHeight": 100,
            "pHex": 80,
            "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsSAAALEgHS3X78AAADs0lEQVR4nO2cjY3bMAyF6U5wI9wGvQ163SDdICPcCNkgI2SEdIOkEzgbOBukG7AwwACqk8iUbEm0/D4gwAGXH9rPEh8l2gQAAAAAAAAAAAAAAAAAAAAAAMAKjVUlmPlT/rw2TXMtHE42igrCzO9E1J/470T0Ia83z0cuvUBE9IeIzk3TXDKGWyfM/MbMW2ZueTodM+9FWBCCCLFj5tsMQjzjxMwfEEUBM28SCjGkHzG+aW/dMPMhkxAuLUbLAJmi5sgTsdyWKMq3FF8qU8ZJXFMsvYM6E9HfyM/3MfQXxHa+I1sg/VUZMTKOzPzl1B4P9E5KctFe3FUI6xRFxNAm707sb1QC7sUTZ6VlN/8RGyZQjN1cTkiE0Y6YQ63n/z/kStfQC7ZJ8PshBqJuUQLFSOZ6RJSjMpY6c4ok2OJiDGLS1D3HHLFkJaDga3NXzorY6hFEpgazYjhx+qbSOqaswOR5LL2m9EKUOpL6Up2MFJQ7ec3u8IogNQa8vgUCC751rxulRqpgiGGB0tU3cLBSfa+Rh66Tvvomoi/Fuej3KX5a7fxwOlp+ENH7i46Wq9PFcpFOltj9l/kRa6ihWMHnQ6z518SdyqNvXyb3AWkSuDkxEnW0dMWFUQR5MCjGJmIHMYRyKw4jB2au4AtYbZ5KGfMi8+8z9tmDGaFQe1H+WktEuY+UzmKNUUiMcqJYJlCMm7x/O5xyxAh8Rrgy1F53AgrW4I4WWRXWin2rvsHbuWKfHqj8T8Ok3t6AvjKTtVg0ThH3qreqvd9qELDiPMv8HrAruvyt4MgiLpsYg1g1jXjmHKiahA3YSboSA+JdnvOSg0txj0jSglWmTE3cNta/NCQcGVkSq+SwMZZjhxMVcl1Ol6O03PadV+B6k3YUFbkalcdyyh2XGuVVdRsmRak5fOIUW85RjnZ7nTdT511P3inqaALyoWbX9YEkDw6QarsdeQgAyRbweeS7trIFS7LF6n1/DiRPdIrj+9U0ze/iwVbr3R2UqwflnVf11a2DMkdmdYPDAFd3b4ZnU88lvx2uxqdHYM55KZfGq95DUObN9HcCLya5JUbMjKb7JZ2ZMRGEIYpfnGaGqSGKTd+LXULIQHaDo7V6xs9bUrKVAMohWa4YMoSySJ42pSueloC+JUG5jHSb+iNjquNuKgfNFvDUH/DNjWizfMLIVkQ3x5c/Uxy3Q3vwOK/pF7GIcs8l3eoeDhaJ3MtyzyktpncAAAAAAAAAAAAAAAAAAAAAAAAAADADRPQPx/FYbD5wrd4AAAAASUVORK5CYII=",
            "texId": "hills"
        }
    },
    {
        "display": "forest",
        "bgColor": 9226047,
        "id": "default_forest",
        "symbol": {
            "color": 4029989,
            "texWidth": 100,
            "texHeight": 100,
            "pHex": 80,
            "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsSAAALEgHS3X78AAAGn0lEQVR4nO2di1EjORCGW7zNo45TAmciWBPB4QwggsURLEQARIA3AiACuAiACOAiwBFoXUBB8dRW+3qu7LHHI81IGmnQV0V5izUzsn631OpWayASiUQikYKwKjpOCLEOAFsA0AKAP+gV6QPAv/R6yzm/+mrCOhOERNgFgO9DAqhwAQBnnPMLV22tEuuCkBB7APADANZLXKoHAEec81ODzfMOq4IIIbYB4KSkEGluAaDDOb81eE1vmLHVECEECnFuWAyg4e5SCLFr+LpeYNxCaIg6p0nbNp26DWE2LOTSkRjISd0sxaggNEzpeFAmOKG5qhYYG7KoU84r6hRct2xyznsV3d8YRiyE5o2TCj8H3v+4wvsbw9SQdWDBm9JlWwjhau6yRmlBhlbgPnDgZS9rYMJCfLCOhC0hRNOPphSjkCD4odGjEkL8orCITwTtBmt5WTQ8HXv+oTFKvOlBOwoxp/pHluJSNnC9DjKK0pAlhDi2FJeyQsjeVq6F0Oq7loE8H5kqiBDiMFAxcNjSyjYKIVoUg/sGAE0aDVpJ9pLedk3/vuKc9200PHNSJ7O/tHFTB2CntfM6jVzkJIup6y5jBvOn6TTzREHIm7op0EifyBSFPt+BIZcd77NvSpisSX0vcDEgSWSlf0ne4p3B9VOSMDshoUsxJghd9IehxlZNi+bB5LMdWvQWd0mYUm732JBFCZ8qI7c22KAhyoWD0qehslDOf5IgLjN+rug7XkMVzs9MEkQaa9bXRsnTSzMyh9Qhn+ARrSLpgPSkHnQcyEP2dL/kaUGCiFUFhpaVWNsoF/mfLR0riYK44bvqXaIgblDeN5YWpJYbmD1gXXXYSgsS/EYzj9EXhJb7VuL8EfhLpQsmzSFfolKpApSi55MyhmeusoSzs7MwNzcHMzMzg9eEz8/Pwc/7+/vgR8paRHOU1nhZCao7W/kQ7PxGowHz8/PAmNouJBTl5eUFXl9fbTTJJaec8860+2UJYjx9mwixsLBQ+BpoNc/Pz6EL0+Wc72f957Sc+rmO/zyNxcXFgRiqFpEHWszj42PIQ1lm5dc0QdYp1VkqvrWyslLKKrJAMR4eHuDj48P4tR2QmS/JXKlTHL9dxg22JQaC1ra2tjZwDAJkPSvomDuGUI74UtdSbIoxDFrK/f39YH4JkI20leTGsmixqGUp6EG5EAPIUlZXV53cywJjm0mUgoskyobKohE7CK3DJThsodMQIGNOk3K0F+cUzvkOWUvmpjCT3pQO6MlVcd+SNNMFRtrhd9yhxzlvkzCnwwFJ7BDsmCrAey8tLVXcv4UYSZsXzoeQMOhP41C20Wg0uq6HqjRVfRlKMiKIcsFOFlLKXXLhKt96ilaCDsXb21vVTSlMYUGklC3a4ejVThUMUoYsSKEhi6zi0sdtQ8NR4xDRbj2J4e3eXwxiBobewnAYKeW27xuxAxRkZB+DsuMupWxSEY/3m+kwd/L09ORBS3LBtd2fw2/S+TqFUBI9AN3fQFzgsciHkiBSyq3QShSWl5dDmODP0r9QtZAgD3XBharH4ZSJ5xLnCkJzR5BlCjjBexxOmZjGVbGQoGtGPJ1LullVuyqC/G2+Pe5IwikegW7uUVZzVAQJvTzaWbJMgdwyt9wZT9ZglxpuhMA0b8Uo1Rx+iXIEDzZC4Jn1myoFoGFH4vznlMRQripQEaRXh3lkAreUim5qbgjMq3nHa/6Dq/AidepfSZA2vfaHT1mg4zZ0BMETgA5pe9SwMH0TT2xQEeS6Bic79Ewfo2TrcRkqk3odytyC+Qy5gjDGLmpQVXXtQRuUUHV7f1bczrIEUxWmKkg3YCs5ZYwFU8yqJAhjrD8t/uI5QbVbeaXOGOsGWBB6FJJ1QIHQSScgj+WKMXao8D6v0BKEhq52AKJg+3Y8aIc22sHFIVF8Hb6wXW1qZ3AUivbih2WM7dC30JcxGgXYx3aFKgaUDb/TonGz4rmlR57UBjkeLu5nDaNbMmhDxDad65He99ujJ0F/0zwp4mpChDV5qjRO3KViVBQkvNH4k7G6QJMYzYeQizn1Wyql1PV8rm16SxgkFEJcKQZQu7YfzRcPMPuPHYUhd+rmBFNEQUZr8rOeq9stcgZvEWIKl6DO7ggh9lPz360LIRKiICmo840ms3SIQ5ZnREE8IwriGVEQz6hCkHjq6RSqECQe1uwbUspfUp067pr0CynlnqIcdXsWlr9gZ+eIcSOljM8zcQmeCiGlvEsJcVcgIhwxCVoCll7H+SLiFwDwG71pkchhUCbgAAAAAElFTkSuQmCC",
            "texId": "forest"
        }
    },
    {
        "display": "grassland",
        "bgColor": 13958805,
        "id": "default_grassland",
        "symbol": {
            "color": 5336859,
            "texWidth": 100,
            "texHeight": 100,
            "pHex": 80,
            "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsSAAALEgHS3X78AAAC/UlEQVR4nO3djU0bQRAF4JkoBVwqCB1gKojTAXQAFWAqCB2QDuIOSAdHB6YD6AB3MGijsXKskO07rXff7r1PQsjC4DXPd2vP7Y8QERFNpLn+cWZ2KSILEXlV1TUDK8jMlvbR9Wz/GQd8yfQ4y+j2WabHrU6uQOhIDAQMAwEDG4iZdaHzN7MFQHOy+YrYqBCGiLyISOe3r1T1b/mWnR7qEbLYheFui7YmI/YhYBgIGMg+ZAozCx82QwVgKyJrVd3W9ywmBuKdbu/n+idV/Zm+aaP1gwrAuYjcALRptKmnrJWHESxL16ZCrSwqx1RbmknVh7A2lQg7dTAMBAwDAcNAwDAQMAwEDAMBk6p08sPM7vf9fOT9v0e3zxLeH7q0MmkYkD/ZX+mbk82zql4gNmyupyzYq5BTA3lN3I7cnlEbNqkPCSMPzUwqrmH9BmgDEREREVEOPlx14zNXXnzkCpViZqtoItG++loWc6/2dkfcJ6u5BwKHgYBhIGAYyEih4zez3swefUhtUs0Mts7BZ3MNL8xtU48h5hEyTnxEJP/cwkDAMBAwzQXiy3jco8ze9bYEb8e0qalAfIGb3jveTenalD/+7k1A6H8eDv1Oa0dI/Aq8LNSOndEviNb7ELha1SHs1MEwEDAMBAwDAcNAwDAQMAwETLZlYnOofN5KKOXf8QjB8a+0wkCwdK0Fsq58MtEdQBuIiIjGC1f4fIzTwynGONEI4foy2shzBCXf9sZHRLz8xizxgyEYBgKGgYCparD1YPXqZjcWqyYQf1u8GWxhca6qzdV+ajplxVtYNLnRC/sQMAwETPJAkCbfezXgj39VsShAsk7dn3DvC1CGi0QXAAtNPg4GPIfvCNtq7JXyCLmOnvwqcVunGB4V8W6jkNiHgGEgYBgIGAYChoGAYSBgGAgYBgLmlOX3kltSfOrA/cMWFsWHoSabjtDAFhZbVf1WuhE8Zf3XISzHkTKQp4R/q4SwyUvxbSySzqDyV1jp5SymqHqHaSIiIiLaS0TeAYCVLF9EAVRDAAAAAElFTkSuQmCC",
            "texId": "grassland"
        }
    }
]`)

console.log(DEFAULTTILESET[0].symbol)


export { DEFAULTTILESET }