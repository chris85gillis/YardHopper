import React, { useState, useEffect } from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import PopupCardModal from "@/components/PopupCardModal";
import Card from "@/components/Card";
import { useRouter } from "expo-router";
import { useSavedListings } from "../../context/SavedListingsContext";

type ListingItem = {
  title: string;
  description: string;
  address: {
    zip: number;
    city: string;
    street: string;
    state: string;
  };
  dates: string[];
  images: { uri: string; caption: string }[];
  categories: string[];
  postId: string;
  g: {
    geopoint: {
      _latitude: number;
      _longitude: number;
    };
  };
};

export default function SavedScreen() {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState<ListingItem | null>(null);

  // Access SavedPostsContext
  const { savedListings, fetchSavedListings } = useSavedListings();

  const router = useRouter();

  // Fetch saved listings on component load
  useEffect(() => {
    fetchSavedListings();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSavedListings();
    setRefreshing(false);
  };

  const openModal = (listing: ListingItem) => {
    setSelectedListing(listing);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedListing(null);
  };

  const renderItem = ({ item }: { item: ListingItem }) => (
    <Card
      images={item.images?.map((img) => ({ uri: img.uri })) || []}
      postId={item.postId}
      title={item.title}
      description={item.description}
      address={`${item.address.street}, ${item.address.city}`}
      date={item.dates[0]}
      categories={item.categories}
      isLiked={true} // All items in this screen are saved
      onToggleLike={() => {}} // Optional: Handle unliking here if needed
      route={() =>
        router.push({
          pathname: "./listing/[id]",
          params: { id: item.postId },
        })
      }
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Saved Listings</Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={() => setViewMode(viewMode === "list" ? "map" : "list")}
          style={styles.toggleButton}
        >
          <Ionicons
            name={viewMode === "list" ? "toggle-outline" : "toggle"}
            size={28}
            color="#159636"
          />
          <Text style={styles.toggleText}>
            {viewMode === "list" ? "Map View" : "List View"}
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === "list" ? (
        <FlatList
          data={savedListings}
          renderItem={renderItem}
          keyExtractor={(item) => item.postId}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#159636", "#28a745", "#85e085"]}
              tintColor="#159636"
            />
          }
        />
      ) : (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: savedListings[0]?.g.geopoint._latitude || 37.7749,
            longitude: savedListings[0]?.g.geopoint._longitude || -122.4194,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {savedListings.map((item) => (
            <Marker
              key={item.postId}
              coordinate={{
                latitude: item.g.geopoint._latitude,
                longitude: item.g.geopoint._longitude,
              }}
              title={item.title}
              description={`${item.address.street}, ${item.address.city}`}
              onPress={() => openModal(item)}
            />
          ))}
        </MapView>
      )}

      <PopupCardModal
        isVisible={isModalVisible}
        item={selectedListing}
        onClose={closeModal}
        animation={new Animated.Value(1)}
        onCardPress={(postId) => console.log("Card pressed:", postId)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingVertical: 12,
    backgroundColor: "#F8F8F8",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerText: {
    fontSize: 25,
    fontWeight: "500",
    color: "#159636",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleText: {
    fontSize: 16,
    marginLeft: 8,
    color: "#159636",
  },
  listContent: {
    paddingBottom: 28,
    paddingHorizontal: 8,
  },
  map: {
    flex: 1,
  },
});