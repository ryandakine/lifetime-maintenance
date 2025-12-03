import { useState, useEffect } from 'react'
import { getFavorites, addFavorite, removeFavorite, isFavorite } from '../utils/localStorage'

export function useFavorites() {
    const [favorites, setFavorites] = useState([])

    useEffect(() => {
        setFavorites(getFavorites())
    }, [])

    const toggleFavorite = (equipmentId) => {
        if (isFavorite(equipmentId)) {
            removeFavorite(equipmentId)
        } else {
            addFavorite(equipmentId)
        }
        setFavorites(getFavorites())
    }

    const checkIsFavorite = (equipmentId) => {
        return favorites.includes(equipmentId)
    }

    return {
        favorites,
        toggleFavorite,
        isFavorite: checkIsFavorite
    }
}
