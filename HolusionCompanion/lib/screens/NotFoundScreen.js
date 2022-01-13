import React from 'react';

import { Text, View, ScrollView } from 'react-native'
import { H1 } from '../components/style'
import { useRoute } from '@react-navigation/native';


export default function NotFoundScreen(){
  const {params:{id}} = useRoute();
  return(<ScrollView>
          <H1 primary style={{paddingVertical:50, textAlign:"center"}}>Page non trouvée</H1>
          <View>
            <Text style={{textAlign:"center"}}>Aucune page trouvée avec le nom "{id}"</Text>
          </View>
      </ScrollView>)
}
